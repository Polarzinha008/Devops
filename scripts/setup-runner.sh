#!/usr/bin/env bash
# Prepara a VM Ubuntu para ser o runner self-hosted da esteira.
#
# Uso:
#   ./scripts/setup-runner.sh <TOKEN_DO_RUNNER>
#
# O token é gerado em: GitHub > repositório > Settings > Actions > Runners > New self-hosted runner
# (ele expira em 1 hora).
set -euo pipefail

REPO_URL="https://github.com/CarineCadorin/Devops"
RUNNER_DIR="$HOME/actions-runner"
KIND_VERSION="v0.30.0"
TOKEN="${1:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Uso: $0 <TOKEN_DO_RUNNER>"
  exit 1
fi

echo ">> Dependências básicas"
sudo apt-get update -y
sudo apt-get install -y curl tar git

echo ">> Docker sem sudo para o usuário $USER"
sudo usermod -aG docker "$USER"

if ! command -v kubectl >/dev/null; then
  echo ">> Instalando kubectl"
  KVER=$(curl -fsSL https://dl.k8s.io/release/stable.txt)
  curl -fsSLo /tmp/kubectl "https://dl.k8s.io/release/${KVER}/bin/linux/amd64/kubectl"
  sudo install -m 0755 /tmp/kubectl /usr/local/bin/kubectl
fi

if ! command -v kind >/dev/null; then
  echo ">> Instalando kind ${KIND_VERSION}"
  curl -fsSLo /tmp/kind "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64"
  sudo install -m 0755 /tmp/kind /usr/local/bin/kind
fi

echo ">> Baixando o GitHub Actions runner"
RUNNER_VERSION=$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest \
  | grep -oP '"tag_name":\s*"v\K[^"]+')
mkdir -p "$RUNNER_DIR" && cd "$RUNNER_DIR"
curl -fsSLo runner.tar.gz \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
tar xzf runner.tar.gz && rm runner.tar.gz

echo ">> Registrando o runner no repositório"
./config.sh --unattended \
  --url "$REPO_URL" \
  --token "$TOKEN" \
  --name "$(hostname)-runner" \
  --labels "self-hosted,linux,kind" \
  --replace

echo ">> Instalando como serviço (sobe sozinho no boot)"
sudo ./svc.sh install "$USER"
sudo ./svc.sh start
sudo ./svc.sh status --no-pager || true

echo
echo "Pronto! Confira em ${REPO_URL}/settings/actions/runners (status: Idle)."
echo "Obs.: se 'docker ps' ainda pedir sudo no seu terminal, faça logout/login (grupo docker)."
