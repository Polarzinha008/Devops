# ---------- Estágio 1: builder ----------
# Imagem com o compilador Go. Roda os testes e gera o binário.
FROM golang:1.23-alpine AS builder

WORKDIR /src

COPY go.mod ./
COPY *.go ./

# Se algum teste falhar, o build da imagem falha e a esteira para aqui
RUN go test -v ./...

# Binário estático (sem dependência de libc), menor possível
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/app .

# ---------- Estágio 2: runtime ----------
# Imagem final mínima: só o binário, sem shell, sem compilador, usuário não-root
FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /out/app /app

EXPOSE 8080
USER nonroot:nonroot

ENTRYPOINT ["/app"]
