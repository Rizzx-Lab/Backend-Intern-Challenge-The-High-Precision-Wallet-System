const { withTransaction } = require('../utils/database');
const ledgerService = require('../services/ledgerService');
const decimalService = require('../services/decimalService');

async function deposit(req, res, next) {
    try {
        const { userId, amount } = req.body;
        
        // Validasi input
        if (!userId || !amount) {
            return res.status(400).json({ error: 'userId and amount are required' });
        }
        
        // Gunakan validateUserAmount (tidak boleh negatif)
        const decimalAmount = decimalService.validateUserAmount(amount);
        const formattedAmount = decimalService.formatAmount(decimalAmount);
        
        let result;
        // Gunakan transaksi dengan locking untuk anti race condition
        await withTransaction(async (db) => {
            // Insert ke ledger
            result = await ledgerService.addEntry({
                userId,
                amount: formattedAmount,  // positif
                type: 'deposit'
            });
        });
        
        // Ambil balance terbaru
        const balance = await ledgerService.getBalance(userId);
        
        res.json({
            success: true,
            message: 'Deposit successful',
            transactionId: result.id,
            newBalance: balance
        });
        
    } catch (error) {
        if (error.message.includes('Invalid amount')) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

module.exports = { deposit };