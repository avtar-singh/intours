const fs = require('fs');
const mongoose = require('mongoose');

// 2. ENVIRONMENT VARIABLES CONFIGURATION
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('../../models/tourModel');
// const User = require('../../models/userModel');
// const Review = require('../../models/reviewModel');
// ATLAS DB
// const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASS);
// Local DB
const DB = process.env.DB_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connection successful.'));

// Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data into DB

const importData = async () => {
  try {
    await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    console.log('Data added successfully');
  } catch (err) {
    console.log(err);
    console.log('Data couldnt be added');
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log('Error');
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
