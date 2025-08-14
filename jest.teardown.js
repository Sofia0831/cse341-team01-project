const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.disconnect();
  await global.__MONGO_SERVER__.stop();
};
