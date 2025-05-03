const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Transaction = require('./models/transaction.js');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://root:pXPaXrNt07fibiDd@cluster0.p59yd6g.mongodb.net/Cluster0')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.get('/transactions', (req, res) => {
  const workbook = xlsx.readFile('./report.xls');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { range: 21 });
  res.send(data);
});

app.post('/transactionsSave', async (req, res) => {
    req.body.forEach(element => {
        const transaction = new Transaction({
            date: element['Дата i час операції'],
            detalis: element['Деталі операції'],
            CSSMathSum: element['Сума в валюті картки (UAH)'],
            moneyLeft: element['Залишок після операції'],
        });
        transaction.save();
        
    });
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
