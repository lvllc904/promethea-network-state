# Use an official Clojure runtime as a parent image
FROM clojure:openjdk-17-bullseye

# Set the working directory
WORKDIR /app

# Copy the monorepo-wide ROADMAP.md (needed by the agent)
COPY ROADMAP.md /app/ROADMAP.md

# Copy the source code
COPY packages/sbi-core /app/packages/sbi-core

# Set workdir to the service
WORKDIR /app/packages/sbi-core

# Install dependencies and build uberjar
RUN clojure -T:build uber

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Command to run the application (Uberjar starts much faster)
CMD ["java", "-jar", "target/sbi-core.jar"]
