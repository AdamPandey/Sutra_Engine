FROM node:22-alpine
# Set the working directory inside the container
 WORKDIR /usr/src/app

 # Copy package.json and package-lock.json first to leverage Docker's layer caching
 COPY package*.json ./

 # Install project dependencies
 RUN npm install

 # Copy the rest of your application's source code
 COPY . .

 # Expose the port the app runs on
 EXPOSE 5000

 # The command to run when the container starts
 CMD [ "node", "server.js" ]