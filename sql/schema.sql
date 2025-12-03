-- Enable UUID if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-----------------------------------------------------
-- USERS TABLE
-----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',     -- user/admin
    balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-----------------------------------------------------
-- WITHDRAWS TABLE
-----------------------------------------------------
CREATE TABLE IF NOT EXISTS withdraws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    method TEXT NOT NULL,
    number TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',     -- pending / paid / rejected
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_wd_user ON withdraws(user_id);
CREATE INDEX IF NOT EXISTS idx_wd_status ON withdraws(status);


-----------------------------------------------------
-- OPTIONAL: TRANSACTIONS TABLE (Highly Recommended)
-- This logs every change to balance for security.
-----------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,                    -- credit/debit
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT,
    related_withdraw UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);

