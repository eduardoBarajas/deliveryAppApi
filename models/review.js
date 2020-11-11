const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    _id: mongoose.ObjectId,
    idUser: mongoose.ObjectId, // String is shorthand for {type: String}
    flaggedCount: Number,
    title: String,
    review: String,
    rate: Number,
    reviewedEntityId: mongoose.ObjectId,
    creationDate: Date
});

module.exports = mongoose.model('Reviews', ReviewSchema);