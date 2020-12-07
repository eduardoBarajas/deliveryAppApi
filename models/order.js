const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    _id: mongoose.ObjectId,
    state: Number,
    creationDate: Date,
    creatorUserId: mongoose.ObjectId,
    consumerUserId: mongoose.ObjectId,
    deliveryUserId: mongoose.ObjectId,
    items: { type: Map, of: Number},
    stores: {type: Map, of: String},
    payId: String
});

module.exports = mongoose.model('Orders', OrderSchema);