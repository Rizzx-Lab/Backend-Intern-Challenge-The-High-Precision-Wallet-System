const ledgerService = require('./ledgerService');

async function getBalanceWithHistory(userId) {
    const [balance, transactions] = await Promise.all([
        ledgerService.getBalance(userId),
        ledgerService.getTransactionHistory(userId, 50)
    ]);
    
    return {
        userId: parseInt(userId),
        balance,
        transactions
    };
}

module.exports = { getBalanceWithHistory };