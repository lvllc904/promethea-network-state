FROM node:20-slim
WORKDIR /app
# Copy root package files and workspace definition
COPY package*.json ./

# Copy all source files
COPY . ./
# Install all workspace dependencies
RUN npm install
# Build the entire monorepo (including guardian and lib)
RUN npm run build
# Expose the port used by the authentication service
EXPOSE 8080
ENV PORT=8080
# Start the authentication service
CMD ["npm", "run", "start", "--workspace", "@promethea/authentication-service"]
