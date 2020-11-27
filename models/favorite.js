const mongoose = require('mongoose');
const { Schema } = mongoose;

const FavoriteSchema = new Schema({
    _id: mongoose.ObjectId,
    type: String,
    creationDate: Date,
    likedElementId: mongoose.ObjectId,
    idUser: mongoose.ObjectId,
    liked: Boolean
});

module.exports = mongoose.model('Favorites', FavoriteSchema);