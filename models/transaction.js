const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    date: { type: Date, required: true },
    detalis: { type: String, required: true },
    CSSMathSum: { type: String, required: true },
    moneyLeft: { type: String, required: true },
});

module.exports = mongoose.model('transaction', transactionSchema)