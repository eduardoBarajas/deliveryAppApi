const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountValidationCodeSchema = new Schema({
    _id: mongoose.ObjectId,
    email: String,
    creationDate: Date,
    expiredDate: Date, 
    attemps: {type: Number, default: 0},
    code: String
});

module.exports = mongoose.model('AccountValidationCode', AccountValidationCodeSchema);