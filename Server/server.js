const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB(); // Connect to the database

const app = express();
app.use(cors({
  origin: [
    'https://task-manager-production-5765.up.railway.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', require('./routes/taskRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));