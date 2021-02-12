const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    _id: mongoose.ObjectId,
    unitPrice:  Number, // String is shorthand for {type: String}
    available: Boolean,
    description: String,
    creationDate: Date,
    images: [String],
    mainImage: String,
    name: String,
    isAditional: {type: Boolean, default: false},
    store_id: mongoose.ObjectId,
    verified: Boolean,
    active: Boolean,
    product_type: String,
    categories: [{ type: Schema.Types.ObjectId, ref: 'EntityCategory' }],
    complements: {type: [{id: String, name: String, unitPrice: Number, maxQuantity: Number}], default: []},
    deleted: Boolean
});

module.exports = mongoose.model('Products', ProductSchema);