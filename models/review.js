const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    _id: mongoose.ObjectId,
    idUser: { type: Schema.Types.ObjectId, ref: 'Users' }, // String is shorthand for {type: String}
    flaggedCount: Number,
    review: String,
    rate: Number,
    reviewType: String,
    reviewedEntityId: mongoose.ObjectId,
    creationDate: Date
});

module.exports = mongoose.model('Reviews', ReviewSchema);