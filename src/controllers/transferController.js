const { withTransaction } = require('../utils/database');
const ledgerService = require('../services/ledgerService');
const decimalService = require('../services/decimalService');

async function transfer(req, res, next) {
    try {
        const { fromUserId, toUserId, amount } = req.body;
        
        // Validasi input
        if (!fromUserId || !toUserId || !amount) {
            return res.status(400).json({ error: 'fromUserId, toUserId, and amount are required' });
        }
        
        if (fromUserId === toUserId) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }
        
        // Gunakan validateUserAmount untuk input user (tidak boleh negatif)
        const decimalAmount = decimalService.validateUserAmount(amount);
        const formattedAmount = decimalService.formatAmount(decimalAmount);
        
        let transferResult;
        
        // Transaksi dengan locking untuk anti race condition
        await withTransaction(async (db) => {
            // Cek saldo pengirim
            const senderBalance = await ledgerService.getBalance(fromUserId);
            const senderDecimal = decimalService.parseAmount(senderBalance);
            
            if (!decimalService.isGreaterThanOrEqual(senderDecimal, decimalAmount)) {
                throw new Error(`Insufficient balance. Current balance: ${senderBalance}`);
            }
            
            // Generate reference ID untuk pairing kedua transaksi
            const referenceId = Date.now();
            
            // Insert transfer keluar (debit) - pakai angka NEGATIF
            const outEntry = await ledgerService.addEntry({
                userId: fromUserId,
                amount: `-${formattedAmount}`,  // ini string dengan tanda minus
                type: 'transfer_out',
                referenceId
            });
            
            // Insert transfer masuk (credit) - pakai angka POSITIF
            const inEntry = await ledgerService.addEntry({
                userId: toUserId,
                amount: formattedAmount,
                type: 'transfer_in',
                referenceId
            });
            
            transferResult = {
                referenceId,
                outTransactionId: outEntry.id,
                inTransactionId: inEntry.id
            };
        });
        
        res.json({
            success: true,
            message: 'Transfer successful',
            referenceId: transferResult.referenceId,
            amount: formattedAmount
        });
        
    } catch (error) {
        if (error.message.includes('Invalid amount') || error.message.includes('Insufficient balance')) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

module.exports = { transfer };