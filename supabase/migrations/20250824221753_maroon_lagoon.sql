-- Create database schema for Weekly Tracker

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create weekly_data table
CREATE TABLE IF NOT EXISTS weekly_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week VARCHAR(10) NOT NULL,
    calls INTEGER NOT NULL DEFAULT 0,
    appointments INTEGER NOT NULL DEFAULT 0,
    sales INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week)
);

-- Create bonuses table
CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_data_user_id ON weekly_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_data_week ON weekly_data(week);
CREATE INDEX IF NOT EXISTS idx_bonuses_user_id ON bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_bonuses_date ON bonuses(date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_data_updated_at BEFORE UPDATE ON weekly_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bonuses_updated_at BEFORE UPDATE ON bonuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Admin123!)
INSERT INTO users (email, password_hash, name) 
VALUES (
    'admin@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrator'
) ON CONFLICT (email) DO NOTHING;

-- Insert some sample data
INSERT INTO weekly_data (user_id, week, calls, appointments, sales, revenue)
SELECT 
    u.id,
    '2024-01',
    50,
    12,
    3,
    15000.00
FROM users u WHERE u.email = 'admin@company.com'
ON CONFLICT (user_id, week) DO NOTHING;

INSERT INTO bonuses (user_id, date, amount, description)
SELECT 
    u.id,
    '2024-01-15',
    2500.00,
    'Monthly performance bonus'
FROM users u WHERE u.email = 'admin@company.com';

COMMIT;