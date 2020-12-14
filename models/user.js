const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    _id: mongoose.ObjectId,
    isSubscribedToPushNotifications: {type: Boolean, default: false},
    creatorUserId: {type: mongoose.ObjectId, required: false, default: null},
    name: String,
    creationDate: Date,
    profileImage: {type: String, required: false, default: null},
    address: String,
    addressCoord: {latitude: Number, longitude: Number},
    email: {type: String, required: false, default: null, unique: true},
    phone: String,
    verified: Boolean,
    userRole: {type: String, required: true},
    password: {type: String, required: false, default: null}
});

module.exports = mongoose.model('Users', UserSchema); 