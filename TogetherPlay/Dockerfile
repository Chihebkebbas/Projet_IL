# Stage 1: Build the React Application
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the server code
COPY src ./src

# Copy the built frontend from the previous stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 3001

# Set environment variable
ENV NODE_ENV=production

# Start the server
CMD ["node", "src/server/index.js"]
