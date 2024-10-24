const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./routes');
require('dotenv').config();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Use the router
app.use('/', routes);

// Serve VotingApp.json
app.use('/contract', express.static(path.join(__dirname, 'src/BVote.json')));

app.use('/contracts', express.static(path.join(__dirname, 'src/contracts')));

// Add this line after your other static file declarations
//app.use('/deployment.json', express.static(path.join(__dirname, '../deployment.json')));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
