# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Explicitly remove any node_modules that might have been copied from host 
# (in case .dockerignore was missed or handled incorrectly by older docker versions)
# Then ensure the installed binaries have execute permissions
RUN rm -rf node_modules && npm install && chmod -R +x node_modules/.bin

# Build the application
# We use npx to ensure we use the local binaries
ENV VITE_API_BASE_URL=/api
RUN npx tsc -b && npx vite build

# Production stage
FROM nginx:stable-alpine

# Copy the built application from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
