const mongoose = require('mongoose');
const { Schema } = mongoose;

const EntityCategorySchema = new Schema({
    _id: mongoose.ObjectId,
    description: String,
    entityType: String, // define el tipo de entidad a la cual pertenece esa categoria. ej. Producto o Local
    deleted: Boolean
});

module.exports = mongoose.model('EntityCategory', EntityCategorySchema);