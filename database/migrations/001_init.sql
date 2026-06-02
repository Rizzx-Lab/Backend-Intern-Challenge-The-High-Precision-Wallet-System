-- Tabel users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel ledger (immutable audit trail)
CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount TEXT NOT NULL,  -- Disimpan sebagai string desimal (contoh: "10000.0000")
    type TEXT NOT NULL,    -- 'deposit', 'transfer_out', 'transfer_in'
    reference_id INTEGER,  -- Untuk pairing transfer_out dan transfer_in
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index untuk mempercepat query balance
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger(created_at);

-- Insert sample users
INSERT OR IGNORE INTO users (id, name) VALUES (1, 'User A');
INSERT OR IGNORE INTO users (id, name) VALUES (2, 'User B');