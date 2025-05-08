const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const axios = require('axios');
const Transaction = require('./models/transaction.js');

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

mongoose.connect('mongodb+srv://root:pXPaXrNt07fibiDd@cluster0.p59yd6g.mongodb.net/Cluster0')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const MONOBANK_TOKEN = process.env.MONOBANK_TOKEN;

app.get('/transactions', async (req, res) => {
  try {
    const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 20;
    const response = await axios.get(
      `https://api.monobank.ua/personal/statement/0/${from}`,
      {
        headers: {
          'X-Token': MONOBANK_TOKEN,
        },
      }
    );

    const formatted = response.data.map(tr => ({
      'Дата i час операції': new Date(tr.time * 1000).toLocaleString(),
      'Деталі операції': tr.description,
      'Сума в валюті картки (UAH)': tr.amount / 100 + ' ' + (tr.currencyCode === 980 ? '₴' : ''),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Помилка отримання транзакцій:', error.message);
    res.status(500).send('Помилка при отриманні транзакцій');
  }
});

// app.post('/transactionsSave', async (req, res) => {
//     req.body.forEach(element => {
//         const transaction = new Transaction({
//             date: element['Дата i час операції'],
//             detalis: element['Деталі операції'],
//             CSSMathSum: element['Сума в валюті картки (UAH)'],
//             moneyLeft: element['Залишок після операції'],
//         });
//         transaction.save();
//     });
//     res.send('Transactions saved successfully');
// });

async function fetchAndSaveTransactions() {
  try {
    const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 20;
    const response = await axios.get(
      `https://api.monobank.ua/personal/statement/0/${from}`,
      {
        headers: {
          'X-Token': MONOBANK_TOKEN,
        },
      }
    );

    const formatted = response.data.map(tr => {
      const date = new Date(tr.time * 1000);
      return {
        'Дата i час операції': date,
        'Деталі операції': tr.description,
        'Сума в валюті картки (UAH)': tr.amount / 100 + ' ' + (tr.currencyCode === 980 ? '₴' : ''),
        'Залишок після операції': tr.balance / 100 + ' ' + (tr.currencyCode === 980 ? '₴' : ''),
      };
    });

    await Transaction.insertMany(formatted.map(item => ({
      date: item['Дата i час операції'],
      detalis: item['Деталі операції'],
      CSSMathSum: item['Сума в валюті картки (UAH)'],
      moneyLeft: item['Залишок після операції'] || '', 
    })));
    console.log('Transactions saved');
  } catch (error) {
    console.error('Error fetching and saving transactions:', error.message);
  }
}


setInterval(fetchAndSaveTransactions, 180000);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
