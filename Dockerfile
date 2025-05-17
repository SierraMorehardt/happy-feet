# Use the official Node.js LTS image
FROM node:18

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Rebuild bcrypt for the container's architecture
RUN npm uninstall bcrypt && \
    npm install bcrypt --build-from-source

# Install other dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the application port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=development

# Run the application
CMD ["npm", "run", "dev"]
