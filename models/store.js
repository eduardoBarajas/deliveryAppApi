const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreSchema = new Schema({
    _id: mongoose.ObjectId,
    name:  String, // String is shorthand for {type: String}
    active: Boolean,
    description: String,
    creationDate: Date,
    images: [String],
    logoImage: String,
    address: String,
    addressCoord: {latitude: Number, longitude: Number},
    email: String,
    phones: {local: String, cellphone: String},
    storeType: String, 
    verified: Boolean,
    deleted: Boolean
});

module.exports = mongoose.model('Stores', StoreSchema);