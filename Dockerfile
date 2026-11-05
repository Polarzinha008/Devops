# Imagem enxuta (Alpine) do nginx que já roda como usuário não-root (uid 101)
FROM nginxinc/nginx-unprivileged:1.29-alpine

# Aplica as correções de segurança mais recentes dos pacotes do Alpine
USER root
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/nginx.conf
COPY src/ /usr/share/nginx/html/

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
