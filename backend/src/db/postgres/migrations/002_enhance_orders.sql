-- Add new columns to orders table
ALTER TABLE orders
ADD COLUMN order_number VARCHAR(20) UNIQUE,
ADD COLUMN original_amount DECIMAL(10,2),
ADD COLUMN access_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN invoice_number VARCHAR(50),
ADD COLUMN invoice_url TEXT,
ADD COLUMN invoice_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN notes TEXT,
ADD COLUMN metadata JSONB,
ADD COLUMN payment_transaction_id VARCHAR(100),
ADD COLUMN payment_gateway_order_id VARCHAR(100),
ADD COLUMN payment_gateway_payment_id VARCHAR(100),
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'initiated',
ADD COLUMN payment_gateway VARCHAR(50),
ADD COLUMN payment_gateway_response JSONB,
ADD COLUMN payment_paid_at TIMESTAMP WITH TIME ZONE;

-- Modify existing payment_method column
ALTER TABLE orders
ALTER COLUMN payment_method TYPE VARCHAR(20);

-- Add new indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_course ON orders(user_id, course_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_transaction ON orders(payment_transaction_id);

-- Add check constraints
ALTER TABLE orders
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('initiated', 'processing', 'success', 'failed'));

ALTER TABLE orders
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('card', 'upi', 'netbanking', 'wallet')); 