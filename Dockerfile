# Use Node.js as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Build the Nest.js application
RUN npm run build

# Expose the application port
EXPOSE 3001

# Set the command to run when the container starts
CMD [ "npm", "run", "start:dev" ]
