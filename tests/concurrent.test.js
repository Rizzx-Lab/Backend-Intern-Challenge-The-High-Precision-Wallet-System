const request = require('supertest');
const { getDatabase } = require('../src/utils/database');
const ledgerService = require('../src/services/ledgerService');

// Import app (butuh export app dari index.js)
// Untuk testing, kita buat server terpisah
const express = require('express');
const { deposit } = require('../src/controllers/depositController');
const { transfer } = require('../src/controllers/transferController');
const { getBalance } = require('../src/controllers/balanceController');

const app = express();
app.use(express.json());
app.post('/wallet/deposit', deposit);
app.post('/wallet/transfer', transfer);
app.get('/wallet/balance/:user_id', getBalance);

describe('Race Condition Tests', () => {
    beforeEach(async () => {
        // Reset database sebelum test
        const db = await getDatabase();
        await db.exec('DELETE FROM ledger');
        await db.exec('DELETE FROM users');
        await db.exec("INSERT INTO users (id, name) VALUES (1, 'User A'), (2, 'User B')");
    });
    
    test('5 concurrent deposits should result in correct total balance', async () => {
        const promises = [];
        
        // Kirim 5 request deposit bersamaan
        for (let i = 0; i < 5; i++) {
            promises.push(
                request(app)
                    .post('/wallet/deposit')
                    .send({ userId: 1, amount: '10000.0000' })
            );
        }
        
        const responses = await Promise.all(promises);
        
        // Cek semua response sukses
        responses.forEach(res => {
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
        
        // Cek balance akhir harus 50000.0000
        const balanceRes = await request(app).get('/wallet/balance/1');
        expect(balanceRes.status).toBe(200);
        expect(balanceRes.body.balance).toBe('50000.0000');
    });
    
    test('5 concurrent transfers should not exceed balance', async () => {
        // Deposit dulu 50000
        await request(app)
            .post('/wallet/deposit')
            .send({ userId: 1, amount: '50000.0000' });
        
        const promises = [];
        
        // Kirim 5 request transfer 10000 bersamaan
        for (let i = 0; i < 5; i++) {
            promises.push(
                request(app)
                    .post('/wallet/transfer')
                    .send({ fromUserId: 1, toUserId: 2, amount: '10000.0000' })
            );
        }
        
        const responses = await Promise.all(promises);
        
        // Yang ke-6 harus gagal karena saldo tidak cukup
        const finalBalanceRes = await request(app).get('/wallet/balance/1');
        expect(finalBalanceRes.body.balance).toBe('0.0000');
        
        const receiverBalanceRes = await request(app).get('/wallet/balance/2');
        expect(receiverBalanceRes.body.balance).toBe('50000.0000');
    });
});