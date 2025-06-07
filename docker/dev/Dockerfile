FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Install Prisma CLI
RUN npm install prisma --save-dev

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV API_PREFIX=/api/v1
ENV LOG_LEVEL=debug
ENV LOG_FORMAT=dev

# Expose ports
EXPOSE 3000
EXPOSE 9229

# Start the application with nodemon
CMD ["npm", "run", "dev"] 