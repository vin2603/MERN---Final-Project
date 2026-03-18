const express = require('express');
const dotenv = require('dotenv');
const { chats } = require('./data/data');
const connectDB = require('./config/db');
const color = require('colors');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

connectDB();
const app = express();

app.get('/', (req, res) => {
  res.send('API is Running Successfully');
});

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server Started on PORT ${PORT}`.yellow.bold));
