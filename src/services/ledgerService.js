const { getDatabase } = require('../utils/database');
const decimalService = require('./decimalService');

async function addEntry({ userId, amount, type, referenceId = null }) {
    const db = await getDatabase();
    
    // Gunakan validateInternalAmount (boleh negatif)
    const decimalAmount = decimalService.validateInternalAmount(amount);
    const formattedAmount = decimalService.formatAmount(decimalAmount);
    
    const result = await db.run(
        `INSERT INTO ledger (user_id, amount, type, reference_id) 
         VALUES (?, ?, ?, ?)`,
        [userId, formattedAmount, type, referenceId]
    );
    
    return { id: result.lastID, userId, amount: formattedAmount, type, referenceId };
}

async function getBalance(userId) {
    const db = await getDatabase();
    
    // SUM amount dari semua transaksi user
    const rows = await db.all(
        `SELECT amount FROM ledger WHERE user_id = ?`,
        [userId]
    );
    
    let total = new decimalService.parseAmount('0');
    for (const row of rows) {
        const amount = decimalService.parseAmount(row.amount);
        total = decimalService.add(total, amount);
    }
    
    return decimalService.formatAmount(total);
}

async function getTransactionHistory(userId, limit = 50) {
    const db = await getDatabase();
    
    const rows = await db.all(
        `SELECT id, user_id, amount, type, reference_id, created_at 
         FROM ledger 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
    );
    
    return rows.map(row => ({
        id: row.id,
        amount: row.amount,
        type: row.type,
        referenceId: row.reference_id,
        createdAt: row.created_at
    }));
}

module.exports = { addEntry, getBalance, getTransactionHistory };