# Destinos do Brasil: Pipeline DevSecOps

Frontend de turismo (HTML, CSS e JavaScript servidos por nginx) com uma pipeline no **GitHub Actions** que leva o código do commit até um **cluster kind**, passando por análise de qualidade (**SonarQube**) e de segurança (**Trivy**).

## Pipeline

```
quality (SonarQube) ────────┐
security-iac (Trivy config)─┼──→ build ──→ deploy
security-code (Trivy fs) ───┘   (Docker + Trivy image + push Docker Hub)   (kind)
```

| Etapa do trabalho | Job | O que faz |
|---|---|---|
| 1. Build | `build` | `docker build` da imagem do frontend |
| 2. Sonar | `quality` | Testes + cobertura, análise no SonarQube e **Quality Gate** (falha o job se não passar) |
| 3. Trivy | `security-iac`, `security-code`, `build` | Scan de IaC (Dockerfile e K8s), de secrets e dependências do código, e da imagem Docker. Bloqueia em HIGH/CRITICAL |
| 4. Push | `build` | Publica `usuario/destinos-do-brasil:<commit>` e `:latest` no Docker Hub |
| 5. Deploy | `deploy` | Cria um cluster kind, aplica os manifestos com a imagem do Docker Hub e testa o site com `curl` |

Os relatórios do Trivy vão para a aba **Security → Code scanning** e também ficam como *artifacts* de cada execução.

## Configuração (uma vez)

Em **Settings → Secrets and variables → Actions → New repository secret**, crie:

| Secret | Valor |
|---|---|
| `DOCKER_USERNAME` (ou `DOCKERHUB_USERNAME`) | seu usuário do Docker Hub |
| `DOCKER_PASSWORD` (ou `DOCKERHUB_TOKEN`) | senha ou Access Token do Docker Hub (Account settings → Personal access tokens, permissão *Read & Write*) |
| `SONAR_TOKEN` | token gerado no SonarQube/SonarCloud |
| `SONAR_HOST_URL` (opcional) | URL do servidor SonarQube. Se não existir, usa o SonarCloud (`https://sonarcloud.io`) |

### Opção A: SonarCloud (mais fácil, gratuito para repositório público)
1. Entre em https://sonarcloud.io com o GitHub e importe este repositório.
2. Em *Administration → Analysis Method*, **desative a "Automatic Analysis"** (a análise é feita pela pipeline).
3. Não precisa editar nada: a pipeline usa como organização o dono do repositório (em minúsculas) e como chave do projeto `dono_repositorio`, que é o padrão do SonarCloud ao importar do GitHub. Se o seu projeto tiver outros valores, crie as variáveis `SONAR_ORGANIZATION` e/ou `SONAR_PROJECT_KEY` em *Settings → Secrets and variables → Actions → Variables*.
4. Gere o token em *My Account → Security*. Não precisa criar `SONAR_HOST_URL`.

### Opção B: SonarQube do professor/da turma
Use a URL do servidor em `SONAR_HOST_URL`, crie o projeto com a chave `dono_repositorio` (ou defina a variável `SONAR_PROJECT_KEY`) e gere um token.

## Rodar localmente (para a apresentação)

```bash
# Testes
npm test

# Site sem Docker
npm start            # http://localhost:8080

# Cluster kind local usando a imagem publicada no Docker Hub
kind create cluster --name turismo --config kind-config.yaml
kubectl apply -f k8s/namespace.yaml
sed -E "s#image: .*destinos-do-brasil:.*#image: docker.io/SEU_USUARIO/destinos-do-brasil:latest#" k8s/deployment.yaml | kubectl apply -f -
kubectl apply -f k8s/service.yaml
kubectl -n turismo rollout status deployment/destinos-frontend
# Abra http://localhost:8080
```

## Estrutura

```
src/                     frontend (index.html, styles.css, app.js, destinos.js, filtros.js, fotos.js)
tests/                   testes (node:test) com cobertura para o Sonar
Dockerfile, nginx.conf   imagem nginx não-root e somente leitura
k8s/                     namespace, deployment e service (NodePort 30080)
kind-config.yaml         cluster kind expondo a porta 30080 em localhost:8080
.github/workflows/       pipeline DevSecOps
sonar-project.properties configuração do SonarQube
.trivyignore             exceções justificadas do Trivy
```

## Decisões de segurança
- Container roda como **não-root**, com sistema de arquivos **somente leitura**, sem capabilities e com limites de CPU e memória. O Trivy config não aponta nenhum achado.
- `trivy-action` está fixada por **SHA do commit** (v0.36.0). Em março de 2026, as tags dessa action foram sequestradas num ataque de supply chain (CVE-2026-33634), e fixar pelo SHA protege contra isso.
- Cabeçalhos de segurança no nginx (CSP, X-Frame-Options, nosniff).

## Fotos
As fotos são do **Wikimedia Commons**, com licenças livres, e são carregadas direto de lá (o CSP do nginx libera apenas `commons.wikimedia.org` e `upload.wikimedia.org`). O autor e a licença de cada foto aparecem no site, no rodapé, em "Créditos das fotos". Para trocar uma foto, edite `src/fotos.js` com o nome do arquivo no Commons. Se alguma imagem não carregar, o card mostra um gradiente no lugar.
