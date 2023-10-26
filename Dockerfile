# Use the official Node.js image as the base image
FROM node:20-bullseye-slim

# Install Tor
RUN apt-get update && apt-get install -y tor

# Set a working directory in the container
WORKDIR /app

# Copy your application's package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Start Tor and your Node.js app
CMD service tor start && npm start