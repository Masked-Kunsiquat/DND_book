FROM alpine:latest

WORKDIR /app

# Download and install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip \
    && unzip pocketbase_linux_amd64.zip \
    && rm pocketbase_linux_amd64.zip \
    && chmod +x pocketbase

# Expose the default PocketBase port
EXPOSE 8090

CMD ["./pocketbase", "serve", "--http", "0.0.0.0:8090"]
