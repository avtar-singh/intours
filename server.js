const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception. Shutting down...');
  console.log(`${err.name} - ${err.message}`);
  process.exit(1);
});

// 2. ENVIRONMENT VARIABLES CONFIGURATION
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
// ATLAS DB
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASS);
// Local DB
// const DB = process.env.DB_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connection successful.'));

// 3. INCLUDE APP
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`${err.name} - ${err.message}`);
  console.log('Unhandled Rejection. Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
