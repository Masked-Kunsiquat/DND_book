FROM alpine:latest

ARG PB_VERSION=0.25.1

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    curl \
    jq

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Apply migrations (collections, app user)
COPY ./pb_migrations /pb/pb_migrations

EXPOSE 8080

# Ensure PocketBase runs AFTER superuser creation
CMD ["/bin/sh", "-c", "/pb/pocketbase serve --http=0.0.0.0:8080"]
