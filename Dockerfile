# Use the inglebard/ubuntu-sandbox image as the base
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

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Change the owner of the app directory to the 'user' user
RUN chown -R user:user /home/user/app

# Switch back to the standard user
USER user

# Expose the port for the Node.js application
EXPOSE 3000

# The base image's entrypoint will run, starting the sandbox services.
# To run your application, start this container and then run:
# docker exec <container_id> node /home/user/app/your-main-file.js
# or whatever your start command is.
