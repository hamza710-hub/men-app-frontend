# We only use Docker to build the static files
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# The files will now be sitting in /app/dist inside the container