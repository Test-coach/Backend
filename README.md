# Test Coach Project

This is a full-stack application with separate frontend and backend services.

## Project Structure

```
.
├── frontend/          # Frontend application
├── backend/           # Backend application
└── README.md         # This file
```

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn package manager

## Backend Setup

The backend service is built with Fastify and includes several databases:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Services

The backend uses Docker for the following services:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MongoDB (port 27017)

To start the Docker services:
```bash
cd backend
docker-compose up -d
```

To stop the Docker services:
```bash
docker-compose down
```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:5173 (default Vite port)
- WebSocket endpoint: ws://localhost:3000/ws

## Environment Variables

### Backend
Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://root:mongopass@localhost:27017
POSTGRES_URI=postgresql://dev:password@localhost:5432/myappdb
REDIS_URI=redis://localhost:6379
```

### Frontend
Create a `.env` file in the frontend directory with the following variables:
```
VITE_API_URL=http://localhost:3000
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 