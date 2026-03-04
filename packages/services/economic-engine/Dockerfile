FROM node:20
WORKDIR /app

# Copy everything
COPY . .

# Install and build
RUN npm install
RUN npm run build --workspace=@promethea/economic-engine

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start via workspace
CMD ["npm", "run", "start", "--workspace", "@promethea/economic-engine"]
