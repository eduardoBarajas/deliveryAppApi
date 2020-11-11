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
    store_id: mongoose.ObjectId,
    verified: Boolean,
    active: Boolean,
    product_type: String 
});

module.exports = mongoose.model('Products', ProductSchema);