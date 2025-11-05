# Start from a standard Node.js 18 image
FROM node:18-slim

# Set up the app environment
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev)
# We need typescript to build
RUN npm install

# Copy the rest of your project's files
COPY . .

# Build your TypeScript code
RUN npm run build

# Expose the port your app listens on
EXPOSE 4000

# The command to run your application
# This runs the compiled JavaScript
CMD [ "node", "dist/index.js" ]