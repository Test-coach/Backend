-- Create user_roles table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add role_id to users table
ALTER TABLE users
ADD COLUMN role_id INTEGER REFERENCES user_roles(id);

-- Create index for role_id
CREATE INDEX idx_users_role_id ON users(role_id);

-- Insert default roles
INSERT INTO user_roles (name, description, permissions) VALUES
('admin', 'Administrator with full access', '{"all": true}'),
('instructor', 'Course instructor with teaching permissions', '{"courses": {"create": true, "edit": true, "delete": true}, "students": {"view": true}}'),
('student', 'Regular student user', '{"courses": {"enroll": true, "view": true}, "profile": {"edit": true}}');

-- Create trigger for updated_at on user_roles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 