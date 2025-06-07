# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/src ./src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV API_PREFIX=/api/v1
ENV LOG_LEVEL=info
ENV LOG_FORMAT=combined

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"] 