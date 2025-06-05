# Database Architecture Documentation

## Overview
Our application uses a hybrid database architecture combining PostgreSQL and MongoDB to leverage the strengths of both databases.

## Database Configuration

### PostgreSQL
- **Purpose**: Core data storage, user management, and business logic
- **Configuration**: 
  ```javascript
  // database.config.js
  const postgresConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
  ```
- **Environment Variables**:
  ```
  POSTGRES_HOST=localhost
  POSTGRES_PORT=5432
  POSTGRES_USER=dev
  POSTGRES_PASSWORD=password
  POSTGRES_DB=myappdb
  DATABASE_URL=postgres://dev:password@localhost:5432/myappdb
  ```

### MongoDB
- **Purpose**: Analytics, flexible schema data, and high-volume operations
- **Configuration**:
  ```javascript
  // database.config.js
  const mongoConfig = {
    uri: process.env.MONGO_URI
  };
  ```
- **Environment Variables**:
  ```
  MONGO_URI=mongodb://localhost:27017
  MONGO_DB=typing_analytics
  ```

## Data Distribution

### PostgreSQL (Core Data)
1. **User Management**
   - User accounts and authentication
   - User profiles and preferences
   - Session management
   - Password reset functionality

2. **Course Management**
   - Course details and metadata
   - Course enrollments
   - Course pricing and features

3. **Order System**
   - Orders and order items
   - Payment processing
   - Coupon management

### MongoDB (Analytics & Flexible Data)
1. **User Analytics**
   - User activity tracking
   - Performance metrics
   - Learning progress

2. **Test Content**
   - Typing test passages
   - Test results
   - Keystroke data

## Key Features

### User Management
- Secure password hashing with bcrypt
- Email verification system
- Password reset functionality
- Role-based access control
- User preferences and profiles

### Course System
- Course creation and management
- Enrollment tracking
- Course features and pricing
- Course categories and levels

### Analytics
- User performance tracking
- Test completion statistics
- Learning progress monitoring
- Activity logging

### Order System
- Order processing
- Coupon management
- Payment tracking
- Transaction history

## Database Initialization

### Seeding
- Environment-based admin user creation
- Sample course data
- Test passages
- Coupon examples
- User activity samples

### Migrations
- PostgreSQL schema migrations
- Index creation
- Table relationships
- Data constraints

## Security Features
- SSL configuration for production
- Environment-based configuration
- Secure password storage
- Role-based access control
- Session management

## Best Practices
1. **Data Consistency**
   - PostgreSQL for ACID compliance
   - MongoDB for flexible schema

2. **Performance**
   - Proper indexing
   - Connection pooling
   - Query optimization

3. **Security**
   - Environment variables
   - SSL in production
   - Password hashing

4. **Maintenance**
   - Regular backups
   - Index optimization
   - Connection management

## Usage Examples

### User Creation
```javascript
const user = await User.create({
  username: 'user123',
  email: 'user@example.com',
  password: 'securepassword',
  role: 'user'
});
```

### Course Creation
```javascript
const course = await Course.create({
  title: 'Typing Course',
  slug: 'typing-course',
  price: 99.99,
  features: ['Feature 1', 'Feature 2']
});
```

### Analytics Tracking
```javascript
await mongoDb.collection('user_activity').insertOne({
  userId: user.id,
  type: 'test_completion',
  metrics: {
    wpm: 45,
    accuracy: 95
  }
});
```

## Maintenance
1. Regular database backups
2. Index optimization
3. Connection pool management
4. Performance monitoring
5. Security updates 