# Multi-stage hardened Dockerfile for Go (Golang)
# Stage 1: Build static binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -extldflags '-static'" \
    -o /app/server .

# Stage 2: Distroless / Scratch minimal runtime (Zero CVE attack surface)
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/server /app/server

USER nonroot:nonroot

EXPOSE 8000

ENTRYPOINT ["/app/server"]
