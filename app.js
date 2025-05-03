const express = require('express');

const app = express();

const xlsx = require('xlsx');


console.log(data);

app.get('/transactions' , (req , res) => {
    const workbook = xlsx.readFile('./report.xls');
    const sheetNames = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetNames];
    const data = xlsx.utils.sheet_to_json(worksheet);
    res.send(data);
})



PORT = 3000;

app.listen(PORT , () => console.log(`server is running on port ${PORT}`))