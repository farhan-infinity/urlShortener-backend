# Use Node.js LTS as the base image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy the application code to the container
COPY . .

# Build the Nest.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory to the nestjs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose the application port
EXPOSE 3001

# Set the command to run when the container starts
CMD [ "node", "dist/main" ]
