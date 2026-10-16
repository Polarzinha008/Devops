# Provisionamento de Cluster Kubernetes com Terraform e Kind

## 1. Objetivo

O objetivo desta atividade foi provisionar um cluster Kubernetes local utilizando o Kind (Kubernetes in Docker), com o Terraform sendo utilizado como ferramenta de provisionamento.

Todo o cluster foi criado através do Terraform. Não foi utilizado o comando `kind create cluster` para realizar a criação manual do cluster.

## 2. Identificação do Cluster

- **Nome do cluster:** devops
- **Tecnologia utilizada:** Kind (Kubernetes in Docker)
- **Ferramenta de provisionamento:** Terraform
- **Provider Terraform:** tehcyx/kind
- **Versão da imagem dos nodes:** kindest/node:v1.34.0

## 3. Topologia do Cluster

O cluster possui um total de 3 nodes, sendo:

- **1 control-plane:** responsável pelas funções de controle e gerenciamento do cluster.
- **2 workers:** responsáveis principalmente pela execução dos Pods e aplicações.

A topologia utilizada é:

```text
                    Cluster devops
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
   control-plane      worker         worker
          |              |              |
          v              v              v
devops-control-plane devops-worker devops-worker2

```

## 4. Esteira CI/CD (GitHub Actions + runner self-hosted)

Sobre o cluster criado pelo Terraform foi montada uma esteira que, a cada push na branch `main`, faz o build da aplicação com um Dockerfile multi-stage e o deploy no Kind.

### 4.1 Estrutura

```text
.
├── .github/workflows/ci-cd.yml   # esteira (build + deploy)
├── app/
│   ├── Dockerfile                # multi-stage: builder (golang) -> runtime (distroless)
│   ├── main.go                   # API HTTP simples (/ e /health)
│   ├── main_test.go              # testes unitários (rodam dentro do build)
│   └── go.mod
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml           # 2 réplicas, probes, rolling update
│   └── service.yaml              # NodePort 30080
├── scripts/setup-runner.sh       # prepara a VM como runner self-hosted
├── main.tf / variables.tf / terraform.tfvars
└── README.md
```

### 4.2 Fluxo da esteira

```text
git push (main)
     |
     v
GitHub Actions ──> runner self-hosted (VM Ubuntu, mesma máquina do Kind)
                       |
        job build      |  docker build ./app
                       |    estágio 1 (builder): go test + go build
                       |    estágio 2 (runtime): só o binário, distroless, non-root
                       |  imagem: devops-app:<sha curto>
                       v
        job deploy     |  kind export kubeconfig --name devops
                       |  kind load docker-image devops-app:<sha> --name devops
                       |  kubectl apply -f k8s/   (imagem/versão injetadas via sed)
                       |  kubectl rollout status
                       |  smoke test: curl http://<ip-do-worker>:30080
                       v
                 aplicação no ar no cluster devops
```

**Por que self-hosted?** O cluster Kind só existe dentro da VM (a API escuta em `127.0.0.1`). Um runner hospedado pelo GitHub não conseguiria acessá-lo. Com o runner rodando na própria VM, a esteira usa o Docker e o Kind locais.

**Por que `kind load` e não um registry?** Os nodes do Kind são containers Docker. O `kind load docker-image` copia a imagem direto para dentro de cada node, por isso o Deployment usa `imagePullPolicy: IfNotPresent`, com tag única por commit.

**Dockerfile multi-stage (builder):** o estágio `builder` tem o Go completo, roda os testes (se falharem, o build falha e a esteira para) e compila um binário estático. A imagem final usa `distroless/static` com usuário não-root: fica com poucos MB e sem shell nem compilador.

### 4.3 Como configurar o runner

1. No GitHub: **Settings > Actions > Runners > New self-hosted runner** e copie o token.
2. Na VM:

```bash
git clone https://github.com/CarineCadorin/Devops.git && cd Devops
./scripts/setup-runner.sh <TOKEN>
```

O script instala `kubectl` e `kind`, coloca o usuário no grupo `docker`, registra o runner com os labels `self-hosted,linux,kind` e o instala como serviço.

3. Garanta que o cluster existe (`terraform apply`) e faça um push em `app/`, `k8s/` ou no workflow, ou rode manualmente em **Actions > CI/CD > Run workflow**.

### 4.4 Verificação manual

```bash
kubectl -n devops-app get deploy,pods,svc -o wide
NODE_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' devops-worker)
curl http://$NODE_IP:30080/
# {"app":"devops-app","version":"<sha>","hostname":"devops-app-xxxx","node":"devops-worker2",...}
```

> Segurança: runners self-hosted executam o código do workflow na máquina. Por isso a esteira só dispara em `push` na `main` (e manualmente), nunca em pull requests de forks.
