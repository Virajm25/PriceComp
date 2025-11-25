# Use a lightweight Node.js version
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json first (for better caching)
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your code
COPY . .

# Open port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]