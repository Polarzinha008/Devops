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

