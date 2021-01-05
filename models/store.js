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
    operationSchedule: [{day: String, start: String, end: String}],
    storeOwnerId: mongoose.ObjectId,
    addressCoord: {latitude: Number, longitude: Number},
    email: String,
    phones: {local: String, cellphone: String},
    storeType: String, 
    verified: Boolean,
    deliverFeePerKM: Number,
    orderTypesAvailable: [String],
    orderPayTypesAvailable: [String],
    deleted: Boolean
});

module.exports = mongoose.model('Stores', StoreSchema);