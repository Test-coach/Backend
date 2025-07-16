# Backend Documentation

## Project Summary

This backend powers an advanced admin exam management system, enabling secure and efficient creation, updating, and management of courses and tests. Built with Node.js, Express, and MongoDB/PostgreSQL, it features robust RESTful APIs and integrates interactive Swagger (OpenAPI) documentation for seamless API testing and rapid developer onboarding. The architecture emphasizes high performance, security, and maintainability, ensuring a scalable and developer-friendly platform.

## Project Structure
```
backend/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   ├── orders/       # Order management
│   │   └── coupons/      # Coupon management
│   ├── core/             # Core functionality
│   │   ├── errors/       # Error handling
│   │   └── utils/        # Core utilities
│   ├── db/               # Database configuration
│   │   ├── prisma/       # Prisma schema and migrations
│   │   └── seed.js       # Database seeding
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
├── prisma/               # Prisma configuration
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── tests/                # Test files
```

## Core Features

### 1. User Management
- **Authentication**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control
  - Session management

- **User Operations**
  - Registration with email verification
  - Login with JWT
  - Password reset functionality
  - Profile management
  - User preferences

### 2. Course System
- **Course Management**
  - Course creation and updates
  - Course categorization
  - Course pricing
  - Course features and requirements

- **Enrollment System**
  - Course enrollment
  - Progress tracking
  - Completion status
  - Access control

### 3. Order & Payment System
- **Order Processing**
  - Order creation
  - Payment processing
  - Order status tracking
  - Transaction history

- **Coupon System**
  - Coupon creation
  - Discount application
  - Usage tracking
  - Expiration management

## Database Architecture

### PostgreSQL with Prisma ORM
- User accounts and profiles
- Course and enrollment data
- Orders and payments
- Coupons and discounts

## API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me         # Get user profile
```

### Users
```
GET    /api/users          # List users (admin)
GET    /api/users/:id      # Get user
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
```

### Courses
```
GET    /api/courses        # List courses
POST   /api/courses       # Create course
GET    /api/courses/:id   # Get course
PUT    /api/courses/:id   # Update course
```

### Orders
```
GET    /api/orders        # List orders
POST   /api/orders       # Create order
GET    /api/orders/:id   # Get order
PUT    /api/orders/:id   # Update order
```

### Coupons
```
GET    /api/coupons       # List coupons
POST   /api/coupons      # Create coupon
GET    /api/coupons/:id  # Get coupon
PUT    /api/coupons/:id  # Update coupon
```

## Security Features

### Authentication
- JWT token-based authentication
- Token refresh mechanism
- Secure password storage
- Email verification

### Authorization
- Role-based access control
- Resource ownership validation
- API rate limiting
- Input validation

### Data Protection
- SSL/TLS encryption
- Password hashing
- Secure session management
- XSS protection

## Error Handling
- Centralized error handling
- Custom error classes
- Error logging
- Client-friendly error messages

## Development Guidelines

### Code Style
- ESLint configuration
- Prettier formatting
- JSDoc documentation

### Testing
- Unit tests with Jest
- Integration tests
- API tests
- Performance testing

### Database Operations
```javascript
// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'user',
    password: hashedPassword
  }
});

// Read
const user = await prisma.user.findUnique({
  where: { id: 'user_id' },
  include: { profile: true }
});

// Update
const user = await prisma.user.update({
  where: { id: 'user_id' },
  data: { role: 'admin' }
});

// Delete
const user = await prisma.user.delete({
  where: { id: 'user_id' }
});
```

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   # Create database tables
   npx prisma migrate
   
   # Seed the database
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Maintenance

### Regular Tasks
1. Database backups
2. Log rotation
3. Security updates
4. Performance monitoring

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- System health

## Troubleshooting

### Common Issues
1. Database connection issues
2. Authentication problems
3. Performance bottlenecks
4. API errors

### Debug Tools
- Logging system
- Error tracking
- Performance profiling
- Database monitoring

## API Documentation
- Swagger/OpenAPI integration
- Endpoint documentation
- Request/response examples
- Error codes

## Environment Setup
```bash
# Required environment variables
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/db
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=your_secret_key
```

## Getting Started
1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Run migrations
5. Start development server

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request 

## API Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "error": null,
  "message": "Operation successful"
}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Common Error Codes
- `AUTH_001`: Authentication failed
- `AUTH_002`: Token expired
- `AUTH_003`: Invalid credentials
- `VAL_001`: Validation error
- `DB_001`: Database error
- `NF_001`: Resource not found
- `PERM_001`: Permission denied

## Data Models

### User Model
```javascript
{
  id: UUID,
  username: String,
  email: String,
  password_hash: String,
  role: Enum['user', 'admin'],
  is_verified: Boolean,
  is_active: Boolean,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Course Model
```javascript
{
  id: UUID,
  title: String,
  slug: String,
  description: Text,
  price: Decimal,
  features: Array,
  category: String,
  level: String,
  is_published: Boolean,
  created_by: UUID,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- File uploads: 10 requests per minute

## Caching Strategy
- Course listings: 1 hour
- User profiles: 5 minutes
- Test results: 15 minutes
- Analytics data: 1 day

## Webhook Events
```javascript
// Available webhook events
{
  "user.registered": "User registration completed",
  "user.verified": "Email verification completed",
  "course.created": "New course created",
  "course.updated": "Course updated",
  "test.completed": "Typing test completed",
  "order.created": "New order created",
  "order.paid": "Order payment completed"
}
```

## Integration Points

### Email Service
- SendGrid integration
- Email templates
- Transactional emails
- Marketing emails

### Payment Gateway
- Stripe integration
- Payment processing
- Refund handling
- Subscription management

### Analytics Service
- Google Analytics
- Custom event tracking
- User behavior analysis
- Performance metrics

## Performance Optimization

### Database
- Index optimization
- Query caching
- Connection pooling
- Query optimization

### API
- Response compression
- Request batching
- Pagination
- Field selection

### Caching
- Redis implementation
- Cache invalidation
- Cache warming
- Cache strategies

## Backup Strategy
1. **Database Backups**
   - Daily full backups
   - Hourly incremental backups
   - Point-in-time recovery
   - Backup verification

2. **File Backups**
   - User uploads
   - Course materials
   - System configurations
   - Log files

## Monitoring & Alerts

### System Metrics
- CPU usage
- Memory utilization
- Disk space
- Network traffic

### Application Metrics
- Response times
- Error rates
- Request volume
- User sessions

### Business Metrics
- Active users
- Course enrollments
- Test completions
- Revenue metrics

## Development Workflow

### Git Workflow
1. Feature branches
2. Pull requests
3. Code review
4. Automated testing
5. Deployment

### Code Review Process
1. Code style check
2. Test coverage
3. Security review
4. Performance check
5. Documentation update

### Release Process
1. Version bump
2. Changelog update
3. Tag creation
4. Deployment
5. Monitoring

## Security Checklist
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Data encryption
- [ ] Secure headers
- [ ] Audit logging

## Dependencies
```json
{
  "express": "^4.17.1",
  "pg": "^8.7.1",
  "mongodb": "^4.1.0",
  "jsonwebtoken": "^8.5.1",
  "bcrypt": "^5.0.1",
  "cors": "^2.8.5",
  "helmet": "^4.6.0",
  "winston": "^3.3.3"
}
```

## License
MIT License - See LICENSE file for details 