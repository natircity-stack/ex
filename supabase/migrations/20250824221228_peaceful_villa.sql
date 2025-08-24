-- Create database schema with security best practices

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create weekly_data table
CREATE TABLE IF NOT EXISTS weekly_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_users INTEGER NOT NULL CHECK (total_users >= 0),
    site_activities INTEGER NOT NULL CHECK (site_activities >= 0),
    went_to_branch INTEGER NOT NULL CHECK (went_to_branch >= 0),
    duplicates INTEGER NOT NULL CHECK (duplicates >= 0),
    total_orders INTEGER NOT NULL CHECK (total_orders >= 0),
    orders_shipped INTEGER NOT NULL CHECK (orders_shipped >= 0),
    shipped_orders_amount DECIMAL(12,2) NOT NULL CHECK (shipped_orders_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_orders CHECK (orders_shipped <= total_orders)
);

-- Create bonuses table
CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    rep_name VARCHAR(100) NOT NULL,
    bonus_amount DECIMAL(10,2) NOT NULL CHECK (bonus_amount >= 0),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_data_dates ON weekly_data(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_data_created_at ON weekly_data(created_at);
CREATE INDEX IF NOT EXISTS idx_bonuses_date ON bonuses(date);
CREATE INDEX IF NOT EXISTS idx_bonuses_rep_name ON bonuses(rep_name);
CREATE INDEX IF NOT EXISTS idx_bonuses_created_at ON bonuses(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_data_updated_at BEFORE UPDATE ON weekly_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bonuses_updated_at BEFORE UPDATE ON bonuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit log table for security tracking
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_operation ON audit_log(table_name, operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Create default admin user (password: Admin123!)
-- Note: Change this password immediately after first login!
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'admin@company.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJgusgqHu', -- Admin123!
    'System Administrator',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Grant appropriate permissions (adjust based on your PostgreSQL setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;