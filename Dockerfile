# Stage 1: Build the React frontend
FROM node:18-jammy as builder

WORKDIR /app

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy the rest of the frontend source code
COPY frontend/ ./frontend/

# Build the frontend
RUN cd frontend && npm run build


# Stage 2: Setup the production environment
FROM inglebard/ubuntu-sandbox

# Switch to the root user to install software
USER root

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set the working directory for the application
WORKDIR /home/user/app

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy the backend source code
COPY backend/ ./backend/

# Copy the built frontend from the builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

# Change the owner of the app directory to the 'user' user
RUN chown -R user:user /home/user/app

# Switch back to the standard user
USER user

# Expose the port for the Node.js application
EXPOSE 3000

# The base image's entrypoint will run, starting the sandbox services.
# Start the Node.js application
CMD ["node", "backend/index.js"]
