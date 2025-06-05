-- Add reset password fields to users table
ALTER TABLE users
ADD COLUMN reset_password_token VARCHAR(255),
ADD COLUMN reset_password_expires TIMESTAMP WITH TIME ZONE;

-- Add index for reset token
CREATE INDEX idx_users_reset_token ON users(reset_password_token); 