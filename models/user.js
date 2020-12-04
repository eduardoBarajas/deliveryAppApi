const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    _id: mongoose.ObjectId,
    pushNotificationId: String,
    name: String,
    creationDate: Date,
    profileImage: String,
    address: String,
    addressCoord: {latitude: Number, longitude: Number},
    email: String,
    phone: String,
    verified: Boolean,
    userRole: String,
    password: String
});

module.exports = mongoose.model('Users', UserSchema); 