#!/usr/bin/env bash
set -euo pipefail
sudo sysctl -w vm.max_map_count=524288
echo "vm.max_map_count=524288" | sudo tee /etc/sysctl.d/99-sonarqube.conf >/dev/null
if docker ps -a --format '{{.Names}}' | grep -qx sonarqube; then
  docker start sonarqube
else
  docker run -d --name sonarqube --restart unless-stopped -p 9000:9000 \
    -v sonarqube_data:/opt/sonarqube/data \
    -v sonarqube_extensions:/opt/sonarqube/extensions \
    -v sonarqube_logs:/opt/sonarqube/logs \
    sonarqube:community
fi
echo "Aguardando o SonarQube iniciar (1-3 minutos)..."
for i in $(seq 1 60); do
  STATUS=$(curl -s http://localhost:9000/api/system/status | grep -o '"status":"[A-Z]*"' || true)
  echo "  $STATUS"
  [[ "$STATUS" == '"status":"UP"' ]] && break
  sleep 5
done
echo "SonarQube no ar: http://localhost:9000  (login: admin / admin)"
