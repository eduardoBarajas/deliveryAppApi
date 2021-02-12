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
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Reviews' }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'EntityCategory' }],
    verified: Boolean,
    deliverFeePerKM: Number,
    deliverMaxDistanceInKM: Number,
    orderTypesAvailable: [String],
    payMethodsAvailable: [String],
    minimumConsumeOrder: {type: Number, default: 0},
    deleted: Boolean
});

module.exports = mongoose.model('Stores', StoreSchema);