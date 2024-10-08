const express = require('express');
const app = express();
const port = 3000;

// API endpoint to multiply two numbers
app.get('/multiply', (req, res) => {            //Sample call, should give 20: http://localhost:3000/multiply?a=4&b=5
  // Get the values from the query parameters
  const { a, b } = req.query;

  // Convert to numbers and multiply them
  const result = Number(a) * Number(b);

  // Send the result as a response
  res.json({ result });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});