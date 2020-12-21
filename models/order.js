const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    _id: mongoose.ObjectId,
    state: Number,
    creationDate: Date,
    storeId: {type: mongoose.ObjectId, required: false, default: null, ref: 'Stores'},
    consumerUserId: {type: mongoose.ObjectId, ref: 'Users'},
    deliveryUserId: {type: mongoose.ObjectId, required: false, default: null, ref: 'Users'},
    items: {type: Map, of: Number},
    deliverInstructions: {type: String, required: false, default: null},
    payId: String
});

module.exports = mongoose.model('Orders', OrderSchema);