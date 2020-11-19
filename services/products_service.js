const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const ProductsModel = require('../models/product');
const ReviewsModel = require('../models/review');
const moment = require('moment');

class ProductsService {
    
    constructor () {

    }

    getAllProducts(onlyActive) {
        return new Observable(subscriber => {
            let query_params = {};
            if (onlyActive == 'true') query_params.active = true;
            ProductsModel.find(query_params).sort('-creationDate').exec((err, products) => {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se obtuvieron los productos con exito.', products: products});
            });
        });
    }

    getProductsByIdStore(id_store, onlyActive) {
        return new Observable(subscriber => {
            let query_params = {store_id: id_store};
            if (onlyActive == 'true') query_params.active = true;
            console.log(query_params);
            ProductsModel.find(query_params).sort('-creationDate').exec((err, products) => {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se obtuvieron los productos con exito.', products: products});
            });
        });
    }

    getProductById(product_id) {
        return new Observable(subscriber => {
            ProductsModel.findOne({_id: product_id}).exec((err, product) => {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se obtuvo el producto con exito.', product: product});
            });
        });
    }

    activateProductById(product_id, active) {
        return new Observable(subscriber => {
            ProductsModel.findOne({_id: product_id}, (err, product) => {
                if (err) subscriber.error(err);
                StoresModel.findOne({_id: product.store_id}, (err, store) => {
                    if (err) subscriber.error(err);
                    if (!store.active) {
                        ProductsModel.findOneAndUpdate({ _id: product_id }, { active: active }, {new:true}, (err, product) => {
                            StoresModel.findOneAndUpdate({ _id: store._id }, { active: true }, (err, store) => {
                                subscriber.next({status: 'success', message: 'Se activo el producto y la tienda ya que estaba desactivada.', product: product});
                            });
                        });
                    } else {
                        ProductsModel.findOneAndUpdate({ _id: product_id }, { active: active }, {new:true}, (err, product) => {
                            if (err) subscriber.error(err);
                            ProductsModel.countDocuments({store_id: store._id, active: true}, (err, productos_activos) => {
                                if (productos_activos == 0) {
                                    StoresModel.findOneAndUpdate({ _id: store._id }, { active: false }, (err, store) => {
                                        subscriber.next({status: 'warning', message: 'Se ha desactivado la tienda por no tener ningun producto activo, vuelve a activar la tienda desde el menu anterior.', product: product});
                                    });
                                } else {
                                    subscriber.next({status: 'success', message: 'Se activo con exito.', product: product});
                                }
                            });
                        });
                    }
                });
            });
        });
    }

    deleteProductById(product_id) {
        return new Observable(subscriber => {
            ProductsModel.deleteOne({ _id: product_id }, function (err, product) {
                if (err) subscriber.error(err);
                // revisamos si la tienda no se quedo sin productos, si ya no tiene mas entonces desactivamos la tienda y avisamos al cliente.
                ProductsModel.countDocuments({store_id: product.store_id}, function (err, products_count) {
                    if (err) subscriber.error(err);
                    if (products_count == 0) {
                        StoresModel.findOneAndUpdate({ _id: product.store_id }, { active: false }, function (err, store) {
                            subscriber.next({status: 'warning', message: 'Se ha desactivado la tienda por falta de productos, agrega un producto para volver a activar la tienda.', product: product});
                        });
                    } else {
                        subscriber.next({status: 'success', message: 'Se elimino con exito.', product: product});
                    }
                });
            });
        });
    }

    saveProduct(product) {
        console.log(product);
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (product._id == '') {
                    // si es nulo es por que es una nueva tienda.
                    product._id = mongoose.Types.ObjectId();
                    product.creationDate = moment(new Date());
                    operation_type = 'Save';
                } else {
                    product.creationDate = moment(product.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newProduct = new ProductsModel(product);
                    newProduct.save((err, addedProduct) => {
                        if (err) subscriber.error(err);
                        subscriber.next({status: 'success', message: 'Se agrego el producto con exito.', product: addedProduct});
                    });
                } else {
                    let product_id = product._id;
                    delete product._id;
                    ProductsModel.findOneAndUpdate(
                        { _id: product_id },
                        product,
                        (err, product) => {
                            if (err) subscriber.error(err);
                            subscriber.next({status: 'success', message: 'Se actualizo el producto con exito.', product: product});
                        }
                    );
                }
            } catch(e) {
                subscriber.error(err);
            }
        });
    }

}

module.exports = new ProductsService();
  