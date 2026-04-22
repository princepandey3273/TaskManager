# Step 1: Use an official lightweight Node.js image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
# We do this before copying the rest of the files to leverage Docker layer caching
COPY package*.json ./

# Step 4: Install all dependencies (including devDependencies for Tailwind CSS)
RUN npm install

# Step 5: Copy the rest of your application's source code
COPY . .

# Step 6: Build the production Tailwind CSS bundle
RUN npm run build:css

# Step 7: Remove devDependencies to optimize the final image size
RUN npm prune --production

# Step 8: Expose the port the application runs on
EXPOSE 8000

# Step 9: Define default environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Step 10: Define the command to run your app
CMD ["npm", "start"]
