# Project Structure Guidelines

## Directory-Specific Guidelines

### 1. Controllers (`src/controllers/`)
- Keep controllers thin and focused on HTTP concerns
- Handle request/response only
- Delegate business logic to services
- Example:
```javascript
// Good
const userController = {
  async register(req, res) {
    const userData = req.body;
    const user = await userService.createUser(userData);
    res.status(201).json(user);
  }
};

// Avoid
const userController = {
  async register(req, res) {
    const userData = req.body;
    // Don't put business logic here
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await db.query('INSERT INTO users...');
    // Don't handle email sending here
    await sendWelcomeEmail(user.email);
    res.status(201).json(user);
  }
};
```

### 2. Services (`src/services/`)
- Contain all business logic
- Handle data validation
- Manage transactions
- Example:
```javascript
// Good
class UserService {
  async createUser(userData) {
    await this.validateUserData(userData);
    const hashedPassword = await this.hashPassword(userData.password);
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
    await this.notificationService.sendWelcomeEmail(user);
    return user;
  }
}
```

### 3. Routes (`src/routes/`)
- Define API endpoints
- Use middleware for common operations
- Group related routes
- Example:
```javascript
// Good
const router = express.Router();

router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfile, userController.updateProfile);

// Avoid
const router = express.Router();
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validateProfile, userController.updateProfile);
```

### 4. Middleware (`src/middleware/`)
- Handle cross-cutting concerns
- Keep middleware focused and reusable
- Example:
```javascript
// Good
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError());
  }
};
```

### 5. Database (`src/db/`)
- Separate models and migrations
- Use repositories for data access
- Example:
```javascript
// Good
class UserRepository {
  async findByEmail(email) {
    return this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }
}

// Avoid
// Don't put raw queries in controllers or services
```

### 6. Utils (`src/utils/`)
- Keep functions pure and focused
- Document complex utilities
- Example:
```javascript
// Good
const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Avoid
// Don't put business logic in utils
```

## Best Practices

### 1. Error Handling
```javascript
// Create custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Use in services
if (!userData.email) {
  throw new ValidationError('Email is required');
}

// Handle in controllers
try {
  const user = await userService.createUser(userData);
  res.status(201).json(user);
} catch (error) {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
  } else {
    next(error);
  }
}
```

### 2. Configuration Management
```javascript
// config/database.js
module.exports = {
  development: {
    // development config
  },
  production: {
    // production config
  }
};

// Use in code
const config = require('../config/database')[process.env.NODE_ENV];
```

### 3. Testing Structure
```
tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
```

### 4. Documentation
- Add JSDoc comments for complex functions
- Keep README files updated
- Document API endpoints
- Example:
```javascript
/**
 * Creates a new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<User>} Created user
 * @throws {ValidationError} If user data is invalid
 */
async createUser(userData) {
  // Implementation
}
```

## Adding New Features

### 1. New API Endpoint
1. Create controller in `controllers/`
2. Add service in `services/`
3. Define route in `routes/`
4. Add middleware if needed
5. Update documentation

### 2. New Database Table
1. Create migration in `db/migrations/`
2. Add model in `db/models/`
3. Create repository in `db/repositories/`
4. Update documentation

### 3. New Utility Function
1. Add to appropriate file in `utils/`
2. Add tests
3. Add documentation
4. Update README if needed

## Code Organization Tips

### 1. File Naming
- Use kebab-case for files: `user-service.js`
- Use PascalCase for classes: `UserService`
- Use camelCase for functions: `createUser`

### 2. Import Order
```javascript
// 1. External dependencies
const express = require('express');
const bcrypt = require('bcrypt');

// 2. Internal modules
const config = require('../config');
const { UserService } = require('../services');

// 3. Constants
const { ROLES } = require('../constants');

// 4. Local variables
const router = express.Router();
```

### 3. Export Style
```javascript
// Prefer named exports for multiple items
module.exports = {
  UserService,
  AuthService
};

// Use default export for single items
module.exports = UserService;
```

## Common Pitfalls to Avoid

1. **Business Logic in Controllers**
   - Keep controllers thin
   - Move logic to services

2. **Raw Queries in Services**
   - Use repositories
   - Keep database access isolated

3. **Global State**
   - Avoid global variables
   - Use dependency injection

4. **Circular Dependencies**
   - Plan module structure
   - Use dependency injection

5. **Unhandled Errors**
   - Use try-catch blocks
   - Implement error middleware 