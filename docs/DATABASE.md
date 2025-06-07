# Database Documentation

## Overview
Our application uses PostgreSQL with Prisma ORM for database operations. The database schema is defined in `prisma/schema.prisma`.

## Database Configuration

### PostgreSQL with Prisma
- **Purpose**: Core data storage, user management, and business logic
- **Configuration**: 
  ```javascript
  // .env
  DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name"
  ```

## Schema

### User Model
```prisma
model User {
  id            String          @id @default(uuid())
  email         String          @unique
  username      String          @unique
  password      String
  role          Role           @default(user)
  profile       UserProfile?
  preferences   UserPreference?
  orders        Order[]
  enrollments   CourseEnrollment[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

### UserProfile Model
```prisma
model UserProfile {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  firstName   String?
  lastName    String?
  bio         String?
  phoneNumber String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### UserPreference Model
```prisma
model UserPreference {
  id          String    @id @default(uuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  theme       String    @default("light")
  language    String    @default("en")
  notifications Boolean @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Course Model
```prisma
model Course {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  description String?
  thumbnail   String?
  duration    Int
  price       Decimal
  features    String[]
  category    String
  level       String
  isPublished Boolean   @default(false)
  isFeatured  Boolean   @default(false)
  createdBy   String
  enrollments CourseEnrollment[]
  orderItems  OrderItem[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Order Model
```prisma
model Order {
  id            String      @id @default(uuid())
  orderNumber   String      @unique
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  status        OrderStatus @default(pending)
  amount        Decimal
  originalAmount Decimal
  paymentMethod String?
  paymentStatus PaymentStatus @default(pending)
  currency      String      @default("INR")
  items         OrderItem[]
  metadata      Json?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### Coupon Model
```prisma
model Coupon {
  id          String        @id @default(uuid())
  code        String        @unique
  type        CouponType
  value       Decimal
  maxDiscount Decimal?
  minPurchase Decimal?
  description String?
  startDate   DateTime
  endDate     DateTime
  maxUses     Int?
  createdBy   String
  usage       CouponUsage[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

## Enums

```prisma
enum Role {
  user
  admin
}

enum OrderStatus {
  pending
  processing
  completed
  cancelled
  refunded
}

enum PaymentStatus {
  pending
  paid
  failed
  refunded
}

enum CouponType {
  percentage
  fixed
}
```

## Database Operations

### Using Prisma Client

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

### Transactions

```javascript
const result = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.profile.create({ data: profileData })
]);
```

## Setup and Installation

1. Install Prisma CLI:
   ```bash
   npm install prisma --save-dev
   ```

2. Initialize Prisma:
   ```bash
   npx prisma init
   ```

3. Create database:
   ```bash
   createdb your_database_name
   ```

4. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name"
   ```

5. Create and apply migrations:
   ```bash
   npx prisma migrate dev
   ```

## Seeding

The database can be seeded with initial data using:
```bash
npx prisma db seed
```

Seed data includes:
- Admin user
- Sample courses
- Sample coupons

## Backup and Restore

### Backup
```bash
pg_dump -U username -d database_name > backup.sql
```

### Restore
```bash
psql -U username -d database_name < backup.sql
```

## Performance Optimization

1. Indexes
   - Primary keys are automatically indexed
   - Foreign keys are automatically indexed
   - Add indexes for frequently queried fields

2. Query Optimization
   - Use Prisma's query optimization features
   - Implement pagination for large datasets
   - Use appropriate include/exclude in queries

3. Connection Pooling
   - Prisma handles connection pooling automatically
   - Configure pool size in DATABASE_URL if needed 