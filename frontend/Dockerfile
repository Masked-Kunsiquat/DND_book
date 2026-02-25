# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app and build it
COPY . .
RUN npm run build

# Serve the build with Nginx
FROM nginx:alpine

# Copy the built frontend from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
