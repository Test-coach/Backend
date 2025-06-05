# FastJS - Fastify Web Application

A modern, secure, and scalable web application built with Fastify, featuring authentication, WebSocket support, PostgreSQL database, MongoDB, and Redis caching.

## Features

- 🔐 JWT-based Authentication
- 🗄️ PostgreSQL Database Integration
- 📊 MongoDB NoSQL Database
- 🚀 Redis Caching
- 🔄 WebSocket Support
- 🛡️ Security Features (Helmet, CORS)
- 📝 Request Logging
- 🏥 Health Check Endpoint
- 🔌 Graceful Shutdown

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- MongoDB
- Redis

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
HOST=localhost

# JWT Configuration
JWT_SECRET=your_jwt_secret

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=your_database
PG_USER=your_username
PG_PASSWORD=your_password

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB=your_database

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fastjs
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Health & Testing
- `GET /health` - Health check endpoint
- `GET /test-db` - Test database connection

### Protected Routes
- `GET /protected` - Protected route example (requires JWT)

### WebSocket
- `ws://localhost:3000/ws` - WebSocket endpoint for real-time communication

## Security

The application implements several security measures:
- JWT authentication for protected routes
- Helmet for security headers
- CORS configuration
- Request logging with user agent and IP tracking

## Development

### Project Structure
```
src/
├── app.js              # Main application file
├── auth/               # Authentication related files
├── config/             # Configuration files
│   ├── fastify.config.js
│   ├── plugins.config.js
│   └── server.config.js
└── routes/             # Route handlers
```


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 
