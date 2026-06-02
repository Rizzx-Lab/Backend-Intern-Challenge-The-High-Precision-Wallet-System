# 💼 Mini Wallet API - Panduan Lengkap

ai room chat yang digunakan : https://chat.deepseek.com/share/y1sfti3uvtvqjbktih

Aplikasi **Mini Wallet API** adalah REST API untuk mengelola dompet digital dengan fitur deposit dan transfer uang. Aplikasi ini dibangun menggunakan **Node.js + Express.js** dan **SQLite** dengan mekanisme anti-race condition dan pencatatan transaksi yang immutable.

---

## 📋 Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Prasyarat](#prasyarat)
3. [Instalasi](#instalasi)
4. [Cara Menjalankan](#cara-menjalankan)
5. [Struktur Folder](#struktur-folder)
6. [Flow Aplikasi](#flow-aplikasi)
7. [API Endpoints](#api-endpoints)
8. [Contoh Request](#contoh-request)
9. [Testing](#testing)

---

## ✨ Fitur Utama

- ✅ **Deposit**: Menambah saldo wallet
- ✅ **Transfer**: Transfer uang antar user
- ✅ **Balance Inquiry**: Melihat saldo dan riwayat transaksi
- ✅ **Anti-Race Condition**: Menggunakan SQLite WAL mode dan transaksi IMMEDIATE
- ✅ **Decimal Precision**: Menggunakan Decimal.js untuk akurasi desimal
- ✅ **Immutable Ledger**: Setiap transaksi tercatat dalam ledger yang tidak bisa diubah
- ✅ **Transaction History**: Riwayat transaksi untuk setiap user

---

## 🔧 Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

- **Node.js** versi 14+ ([Download](https://nodejs.org/))
- **npm** (biasanya sudah tersedia dengan Node.js)
- **Git** (untuk clone repository)

Verifikasi instalasi:
```bash
node --version   # Harus v14 atau lebih tinggi
npm --version
```

---

## 📦 Instalasi

### Langkah 1: Clone atau Buka Project

```bash
cd mini-wallet-sqlite
```

### Langkah 2: Install Dependencies

```bash
npm install
```

Perintah di atas akan menginstal semua package yang diperlukan:
- `express` - Web framework
- `sqlite3` - Database SQLite
- `decimal.js` - Presisi desimal
- `dotenv` - Variabel environment
- `nodemon` - Development auto-reload (dev only)
- `jest` - Testing framework (dev only)

---

## 🚀 Cara Menjalankan

### Mode Production

```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### Mode Development (dengan Auto-reload)

```bash
npm run dev
```

Ketika Anda mengubah file, aplikasi akan otomatis reload tanpa perlu restart manual.

### Migrasi Database (Opsional)

Jika Anda ingin menjalankan migrasi secara manual:

```bash
npm run migrate
```

Database akan otomatis di-migrate pada saat pertama kali aplikasi dijalankan.

### Menjalankan Tests

```bash
npm test
```

Tests akan menjalankan test concurrent untuk memastikan anti-race condition berfungsi dengan baik.

---

## 📁 Struktur Folder

```
mini-wallet-sqlite/
│
├── 📄 README.md                      # Dokumentasi original
├── 📄 README_GUIDE.md               # Panduan lengkap ini
├── 📄 package.json                   # Konfigurasi project dan dependencies
├── 📄 .env                           # Variabel environment (PORT, dll)
├── 📄 .gitignore                     # File yang diabaikan git
│
├── 📂 src/                           # Folder source code
│   ├── 📄 index.js                   # Entry point aplikasi
│   │
│   ├── 📂 controllers/               # Layer untuk handle HTTP requests
│   │   ├── 📄 depositController.js   # Handle POST /wallet/deposit
│   │   ├── 📄 transferController.js  # Handle POST /wallet/transfer
│   │   └── 📄 balanceController.js   # Handle GET /wallet/balance/:user_id
│   │
│   ├── 📂 services/                  # Business logic layer
│   │   ├── 📄 ledgerService.js       # Operasi ledger (read/write)
│   │   ├── 📄 balanceService.js      # Kalkulasi balance
│   │   └── 📄 decimalService.js      # Validasi dan format desimal
│   │
│   └── 📂 utils/                     # Utility functions
│       ├── 📄 database.js            # Koneksi & transaksi database
│       └── 📄 errorHandler.js        # Middleware error handling
│
├── 📂 database/                      # Folder database
│   ├── 📄 wallet.db                  # File database SQLite
│   ├── 📄 wallet.db-shm              # SQLite shared memory (WAL mode)
│   ├── 📄 wallet.db-wal              # SQLite write-ahead log
│   │
│   └── 📂 migrations/                # SQL migrations
│       └── 📄 001_init.sql           # Inisialisasi tabel dan data
│
├── 📂 tests/                         # Test files
│   └── 📄 concurrent.test.js         # Test untuk race condition
│
├── 📂 postman/                       # Postman collection
│   └── 📄 Mini_Wallet_API.postman_collection.json
│
└── 📂 node_modules/                  # Installed dependencies (auto-generated)
```

### Penjelasan Folder Penting:

| Folder/File | Fungsi |
|---|---|
| `src/` | Kode utama aplikasi |
| `src/controllers/` | Menangani HTTP requests & responses |
| `src/services/` | Logic bisnis (deposit, transfer, kalkulasi balance) |
| `src/utils/` | Helper functions (database, error handling) |
| `database/` | Menyimpan file SQLite dan migrations |
| `tests/` | Automated tests |

---

## 🔄 Flow Aplikasi

### 1️⃣ Startup Flow

```
npm start
    ↓
index.js (server.js)
    ↓
getDatabase() → Koneksi ke wallet.db
    ↓
runMigrations() → Buat tabel jika belum ada
    ↓
Enable PRAGMA (Foreign Keys, WAL mode)
    ↓
Listen ke port 3000
    ↓
Server ready! ✅
```

### 2️⃣ Deposit Flow

```
POST /wallet/deposit
│
├─ Validasi input (userId, amount)
│
├─ decimalService.validateUserAmount()
│   └─ Cek: amount harus positif
│
├─ BEGIN IMMEDIATE transaction
│   ├─ Insert ke ledger (amount positif, type='deposit')
│   └─ COMMIT
│
├─ ledgerService.getBalance(userId)
│   └─ SUM semua amount di ledger
│
└─ Return response dengan newBalance
```

### 3️⃣ Transfer Flow

```
POST /wallet/transfer
│
├─ Validasi input (fromUserId, toUserId, amount)
│
├─ decimalService.validateUserAmount()
│   └─ Cek: amount harus positif
│
├─ BEGIN IMMEDIATE transaction
│   ├─ Check: balance fromUserId >= amount
│   │
│   ├─ Insert ledger untuk penerima (+amount, type='transfer_in')
│   │
│   ├─ Insert ledger untuk pengirim (-amount, type='transfer_out')
│   │   └─ Kedua entry punya reference_id yang sama
│   │
│   └─ COMMIT
│
├─ Get balance terbaru (from & to user)
│
└─ Return response dengan balances
```

### 4️⃣ Balance Inquiry Flow

```
GET /wallet/balance/:user_id
│
├─ Query: SELECT amount FROM ledger WHERE user_id = ?
│
├─ Loop & sum semua amount
│   └─ Menggunakan Decimal.js untuk presisi
│
├─ Query: SELECT * FROM ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
│   └─ Ambil 50 transaksi terakhir
│
└─ Return balance + transaction history
```

### 5️⃣ Database Transaction (Anti-Race Condition)

```
withTransaction(callback)
    ↓
BEGIN IMMEDIATE (lock database untuk write)
    ↓
Execute callback
    ↓
COMMIT (release lock) ✅
    ↓
Atau...
    ↓
ROLLBACK (if error) ❌
```

---

## 🌐 API Endpoints

### 1. Deposit
Menambah saldo wallet

```
POST /wallet/deposit
Content-Type: application/json

{
  "userId": 1,
  "amount": 50000.50
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Deposit successful",
  "transactionId": 1,
  "newBalance": "50000.5000"
}
```

---

### 2. Transfer
Transfer uang antar user

```
POST /wallet/transfer
Content-Type: application/json

{
  "fromUserId": 1,
  "toUserId": 2,
  "amount": 10000.25
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transfer successful",
  "transactionId": 2,
  "fromUserBalance": "40000.2500",
  "toUserBalance": "60000.2500"
}
```

**Response (400 Bad Request - Insufficient Balance):**
```json
{
  "success": false,
  "error": "Insufficient balance"
}
```

---

### 3. Get Balance & History
Lihat saldo dan riwayat transaksi

```
GET /wallet/balance/1
```

**Response (200 OK):**
```json
{
  "userId": 1,
  "balance": "40000.2500",
  "transactions": [
    {
      "id": 2,
      "amount": "-10000.2500",
      "type": "transfer_out",
      "referenceId": 2,
      "createdAt": "2024-01-15T10:30:45.123Z"
    },
    {
      "id": 1,
      "amount": "50000.5000",
      "type": "deposit",
      "referenceId": null,
      "createdAt": "2024-01-15T10:25:30.456Z"
    }
  ]
}
```

---

### 4. Health Check
Cek status server

```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## 📝 Contoh Request

### Menggunakan cURL

```bash
# Deposit
curl -X POST http://localhost:3000/wallet/deposit \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 100000}'

# Transfer
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromUserId": 1, "toUserId": 2, "amount": 25000}'

# Check Balance
curl http://localhost:3000/wallet/balance/1

# Health Check
curl http://localhost:3000/health
```

### Menggunakan Postman

1. Buka Postman
2. Import file: `postman/Mini_Wallet_API.postman_collection.json`
3. Pilih environment dan request yang ingin di-test
4. Klik "Send"

### Menggunakan fetch (JavaScript)

```javascript
// Deposit
fetch('http://localhost:3000/wallet/deposit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 1,
    amount: 100000
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Transfer
fetch('http://localhost:3000/wallet/transfer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromUserId: 1,
    toUserId: 2,
    amount: 25000
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Get Balance
fetch('http://localhost:3000/wallet/balance/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🧪 Testing

### Menjalankan Tests

```bash
npm test
```

### Yang Ditest

File `tests/concurrent.test.js` melakukan test:

1. **Race Condition Test** - Multiple concurrent transactions
   - Mengirim 100+ requests secara bersamaan
   - Memastikan balance tetap akurat
   - Tidak ada lost updates

2. **Transfer Consistency** - Memastikan transfer in/out seimbang
3. **Decimal Precision** - Hasil kalkulasi desimal akurat

### Output Testing

```
 PASS  tests/concurrent.test.js (3.456 s)
  ✓ Should handle concurrent deposits without lost updates (1234 ms)
  ✓ Should handle concurrent transfers correctly (2456 ms)
  
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

---

## 🗄️ Database Schema

### Tabel: users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Contoh Data:**
```
id | name    | created_at
---|---------|--------------------
1  | User A  | 2024-01-15 10:00:00
2  | User B  | 2024-01-15 10:01:00
```

---

### Tabel: ledger (Immutable Audit Trail)
```sql
CREATE TABLE ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Penjelasan Kolom:**
- `amount` - Disimpan sebagai TEXT (string desimal) untuk presisi
- `type` - Jenis transaksi: 'deposit', 'transfer_in', 'transfer_out'
- `reference_id` - Untuk pair transfer_in dan transfer_out

**Contoh Data:**
```
id | user_id | amount      | type          | reference_id | created_at
---|---------|-------------|---------------|--------------|---------------------
1  | 1       | 100000.0000 | deposit       | NULL         | 2024-01-15 10:05:00
2  | 2       | 25000.0000  | transfer_in   | 3            | 2024-01-15 10:10:00
3  | 1       | -25000.0000 | transfer_out  | 3            | 2024-01-15 10:10:00
4  | 1       | 50000.5000  | deposit       | NULL         | 2024-01-15 10:15:00
```

---

## ⚙️ Konfigurasi

### File .env

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database/wallet.db
```

**Penjelasan:**
- `PORT` - Port tempat server berjalan (default: 3000)
- `NODE_ENV` - Development atau Production
- `DATABASE_PATH` - Lokasi file SQLite database

---

## 🛡️ Fitur Anti-Race Condition

Aplikasi menggunakan beberapa mekanisme untuk mencegah race condition:

### 1. SQLite WAL Mode (Write-Ahead Logging)
```javascript
PRAGMA journal_mode = WAL;
```
- Memungkinkan concurrent reads
- Menjaga integritas data saat writes

### 2. Transaction IMMEDIATE
```javascript
BEGIN IMMEDIATE
```
- Lock database segera saat transaksi dimulai
- Mencegah dirty reads dan lost updates

### 3. Atomic Operations
```javascript
try {
    await db.exec('BEGIN IMMEDIATE');
    // Multiple operations
    await db.exec('COMMIT');
} catch {
    await db.exec('ROLLBACK');
}
```

---

## 💰 Precision Decimal dengan Decimal.js

Mengapa menggunakan Decimal.js?

**Masalah dengan floating point:**
```javascript
0.1 + 0.2 === 0.3  // false! (JavaScript quirk)
// Hasilnya: 0.30000000000000004
```

**Solusi dengan Decimal.js:**
```javascript
const Decimal = require('decimal.js');
new Decimal('0.1').plus('0.2').toString()  // "0.3" ✅
```

---

## 🔍 Troubleshooting

### Problem: "EADDRINUSE: address already in use :::3000"

**Solusi:**
```bash
# Temukan process yang menggunakan port 3000
lsof -i :3000

# Kill process (Linux/Mac)
kill -9 <PID>

# Atau gunakan port lain
PORT=3001 npm start
```

---

### Problem: "SQLITE_CANTOPEN: unable to open database file"

**Solusi:**
```bash
# Pastikan folder database ada
mkdir -p database

# Atau jalankan migrasi
npm run migrate
```

---

### Problem: "Cannot find module 'sqlite3'"

**Solusi:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoring

### Melihat Log Aplikasi

Saat aplikasi running, Anda akan melihat:
```
✅ Database connected and migrated
🚀 Server running on http://localhost:3000
📋 Endpoints:
   POST   /wallet/deposit
   POST   /wallet/transfer
   GET    /wallet/balance/:user_id
```

### Query Database Langsung

Menggunakan sqlite3 CLI:
```bash
sqlite3 database/wallet.db

# Melihat data
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM ledger WHERE user_id = 1;

# Exit
sqlite> .quit
```

---

## 📚 Resources Tambahan

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Decimal.js Documentation](https://mikemcl.github.io/decimal.js/)
- [Node.js SQLite3 Module](https://github.com/mapbox/node-sqlite3)

---

## 📝 Lisensi

MIT License - Bebas digunakan untuk keperluan pribadi dan komersial.

---

## 🎯 Tips & Best Practices

1. **Selalu gunakan transactions** untuk operasi yang melibatkan multiple writes
2. **Validasi input** di controller sebelum kirim ke service
3. **Gunakan Decimal** untuk semua kalkulasi uang
4. **Periksa balance** sebelum transfer untuk mencegah negative balance
5. **Keep ledger immutable** - jangan modify entries yang sudah ada
6. **Monitor database size** - ledger akan terus bertambah

---

Selamat menggunakan Mini Wallet API! 🎉

Jika ada pertanyaan atau masalah, silakan buka issue di repository ini.
