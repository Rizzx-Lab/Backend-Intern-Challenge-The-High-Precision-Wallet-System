require('dotenv').config();
const express = require('express');
const { getDatabase } = require('./utils/database');
const { deposit } = require('./controllers/depositController');
const { transfer } = require('./controllers/transferController');
const { getBalance } = require('./controllers/balanceController');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.post('/wallet/deposit', deposit);
app.post('/wallet/transfer', transfer);
app.get('/wallet/balance/:user_id', getBalance);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Inisialisasi database
        await getDatabase();
        console.log('✅ Database connected and migrated');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Endpoints:`);
            console.log(`   POST   /wallet/deposit`);
            console.log(`   POST   /wallet/transfer`);
            console.log(`   GET    /wallet/balance/:user_id`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();