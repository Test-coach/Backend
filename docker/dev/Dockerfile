FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install Prisma CLI
RUN npm install prisma --save-dev

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Expose ports
EXPOSE 3000
EXPOSE 9229

# Start the application with nodemon
CMD ["npm", "run", "dev"] 