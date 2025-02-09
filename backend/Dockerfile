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

# Copy the init script and ensure execution permissions
COPY ./init.sh /pb/init.sh
RUN chmod +x /pb/init.sh

EXPOSE 8080

# Start PocketBase and initialize the superuser
CMD ["/bin/sh", "-c", "/pb/init.sh & /pb/pocketbase serve --http=0.0.0.0:8080"]
