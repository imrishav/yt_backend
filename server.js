require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./database/sequelize');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');

const errorHandler = require('./handlers/errorHandler');
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// sequelize
//   .authenticate()
//   .then((err) => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch((errs) => {
//     console.log('Unsuccesfult.', errs);
//   });

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/video', videoRoutes);

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log('Server has Started on: ', PORT);
});
