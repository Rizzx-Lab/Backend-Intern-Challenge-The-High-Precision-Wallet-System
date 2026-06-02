const Decimal = require('decimal.js');

// Presisi 4 digit di belakang koma
const PRECISION = 4;

// Untuk validasi input dari USER (tidak boleh negatif)
function validateUserAmount(amountString) {
    // Cek format: harus angka dengan maksimal 4 desimal, tanpa tanda negatif di awal
    const regex = /^\d+(\.\d{1,4})?$/;
    if (!regex.test(amountString)) {
        throw new Error(`Invalid amount format: ${amountString}. Max 4 decimal places allowed. No negative sign.`);
    }
    
    // Parse ke Decimal
    const decimal = new Decimal(amountString);
    if (decimal.isNegative()) {
        throw new Error('Amount cannot be negative for deposit/transfer');
    }
    
    return decimal;
}

// Untuk validasi internal (boleh negatif, untuk transfer_out)
function validateInternalAmount(amountString) {
    // Cek format: boleh diawali tanda minus, maksimal 4 desimal
    const regex = /^-?\d+(\.\d{1,4})?$/;
    if (!regex.test(amountString)) {
        throw new Error(`Invalid amount format: ${amountString}. Max 4 decimal places allowed.`);
    }
    
    const decimal = new Decimal(amountString);
    return decimal;
}

function add(a, b) {
    return new Decimal(a).plus(new Decimal(b));
}

function subtract(a, b) {
    return new Decimal(a).minus(new Decimal(b));
}

function isGreaterThanOrEqual(a, b) {
    return new Decimal(a).gte(new Decimal(b));
}

function formatAmount(decimal) {
    return decimal.toFixed(PRECISION);
}

// Untuk parsing string ke Decimal tanpa validasi (flexible)
function parseAmount(amountString) {
    return new Decimal(amountString);
}

module.exports = {
    validateUserAmount,
    validateInternalAmount,
    add,
    subtract,
    isGreaterThanOrEqual,
    formatAmount,
    parseAmount,
    PRECISION
};