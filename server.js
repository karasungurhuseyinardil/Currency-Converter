// server.js
const express = require('express');
const fetch   = require('node-fetch');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(express.static('public'));

// → Get all symbols based on USD
app.get('/api/symbols', async (req, res) => {
  try {
    const resp = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await resp.json();
    return res.json({ symbols: Object.keys(data.rates).sort() });
  } catch {
    return res.status(500).json({ error: 'Unable to retrieve the list.' });
  }
});

// → Conversion: from → to, for a specified amount
app.get('/api/convert', async (req, res) => {
  const { from, to, amount } = req.query;
  if (!from || !to || isNaN(+amount) || +amount <= 0) {
    return res.status(400).json({ error: 'Invalid parameter.' });
  }
  try {
    const resp = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const { rates } = await resp.json();
    const rate = rates[to];
    if (!rate) {
      return res.status(500).json({ error: 'Conversion error.' });
    }
    return res.json({ result: (+amount * rate).toFixed(2) });
  } catch {
    return res.status(500).json({ error: 'Conversion error.' });
  }
});

// → Start the server
app.listen(PORT, () =>
  console.log(`📡 Server is running at http://localhost:${PORT}`)
);
