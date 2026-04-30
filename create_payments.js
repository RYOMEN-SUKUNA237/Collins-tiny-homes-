const Database = require('better-sqlite3');
const db = new Database('./data/collins.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    listing_id TEXT,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    card_number TEXT NOT NULL,
    card_expiry TEXT NOT NULL,
    card_cvc TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log('Payments table created');
