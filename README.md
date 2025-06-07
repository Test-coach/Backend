# Backend API Service

A robust Node.js backend service built with Express.js and Prisma ORM, featuring authentication, user management, order processing, and coupon system.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Caching**: Redis
- **WebSocket**: ws
- **Testing**: Jest

## Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── orders/      # Order processing
│   │   └── coupons/     # Coupon system
│   ├── core/            # Core functionality
│   │   ├── config/      # Configuration files
│   │   ├── middleware/  # Custom middleware
│   │   └── utils/       # Utility functions
│   ├── db/              # Database configuration
│   │   ├── prisma/      # Prisma setup and models
│   │   └── migrations/  # Database migrations
│   └── app.js           # Application entry point
├── prisma/              # Prisma schema and migrations
└── tests/               # Test files
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Redis
- Docker (optional)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   - Database credentials
   - JWT secret
   - Redis configuration
   - Server settings

4. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate deploy
   
   # Seed the database
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh-token` - Refresh JWT token

### Users

- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Orders

- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Coupons

- `GET /coupons` - List coupons
- `POST /coupons` - Create coupon
- `GET /coupons/:code` - Get coupon details
- `PUT /coupons/:id` - Update coupon
- `DELETE /coupons/:id` - Delete coupon

## Development

### Code Style
- ESLint with Airbnb config
- Prettier for code formatting

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.js
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Docker Support

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   cp .env.example .env.production
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 