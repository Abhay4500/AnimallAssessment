const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
    await mongoose.connect(mongoUri);
    return mongoose.connection;
}

module.exports = {
    connectToDatabase
};
