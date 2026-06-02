const balanceService = require('../services/balanceService');

async function getBalance(req, res, next) {
    try {
        const userId = req.params.user_id;
        
        if (!userId) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        
        const result = await balanceService.getBalanceWithHistory(userId);
        
        res.json(result);
        
    } catch (error) {
        next(error);
    }
}

module.exports = { getBalance };