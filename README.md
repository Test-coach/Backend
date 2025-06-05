# Demo Repository

A full-stack application with Node.js backend and React frontend.

## Project Structure

```
demo-repository/
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── modules/   # Feature modules (auth, users, orders)
│   │   ├── core/      # Core functionality
│   │   ├── db/        # Database configuration
│   │   └── utils/     # Utility functions
└── frontend/          # React frontend
```

## Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials.

3. Set up the database:
   ```bash
   # Create database tables
   npx prisma migrate
   
   # Seed the database with initial data
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Database

The application uses Prisma ORM with PostgreSQL. The database schema is defined in `backend/prisma/schema.prisma`.

### Key Features

- User authentication (register, login, profile)
- Order management
- Coupon system
- Role-based access control

### API Endpoints

#### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get user profile

#### Users
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

#### Orders
- GET `/api/orders` - Get all orders
- POST `/api/orders` - Create new order
- GET `/api/orders/:id` - Get order by ID
- PUT `/api/orders/:id` - Update order
- DELETE `/api/orders/:id` - Delete order

## Development

### Code Style

- Backend: ESLint with Airbnb config
- Frontend: ESLint with React config

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set up production environment variables:
   ```bash
   cd backend
   cp .env.example .env.production
   ```

3. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 