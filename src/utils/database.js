const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let dbInstance = null;

async function getDatabase() {
    if (dbInstance) return dbInstance;

    const dbPath = path.resolve(__dirname, '../../database/wallet.db');
    
    // Pastikan folder database ada
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database,
        // Mode WAL untuk better concurrent read/write
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
    });

    // Enable foreign keys dan WAL mode
    await dbInstance.exec('PRAGMA foreign_keys = ON');
    await dbInstance.exec('PRAGMA journal_mode = WAL');
    
    // Jalankan migrasi jika tabel belum ada
    await runMigrations(dbInstance);

    return dbInstance;
}

async function runMigrations(db) {
    const migrationSQL = fs.readFileSync(
        path.resolve(__dirname, '../../database/migrations/001_init.sql'),
        'utf8'
    );
    await db.exec(migrationSQL);
}

// Untuk transaksi dengan locking (BEGIN IMMEDIATE)
async function withTransaction(callback) {
    const db = await getDatabase();
    await db.exec('BEGIN IMMEDIATE');
    try {
        const result = await callback(db);
        await db.exec('COMMIT');
        return result;
    } catch (error) {
        await db.exec('ROLLBACK');
        throw error;
    }
}

module.exports = { getDatabase, withTransaction };