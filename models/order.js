const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const OrderSchema = new Schema({
    _id: mongoose.ObjectId,
    seqOrders: Number,
    state: Number,
    creationDate: Date,
    modifiedDates: {type: [{_id: Number, date: Date}], default: []},
    storeId: {type: mongoose.ObjectId, required: false, default: null, ref: 'Stores'},
    consumerUserId: {type: mongoose.ObjectId, ref: 'Users'},
    deliveryUserId: {type: mongoose.ObjectId, required: false, default: null, ref: 'Users'},
    items: {type: Map, of: Number},
    itemsComplements: {type: [{productId: mongoose.ObjectId, id: String, quantity: Number}], default: []},
    deliverInstructions: {type: String, required: false, default: null},
    deliveryCost: {type: Number, default: 0},
    estimatedServingTime: {type: Number, default: 0},
    orderType: String,
    payMethod: String,
    payId: String
});
OrderSchema.plugin(AutoIncrement, {inc_field: 'seqOrders'});

module.exports = mongoose.model('Orders', OrderSchema);