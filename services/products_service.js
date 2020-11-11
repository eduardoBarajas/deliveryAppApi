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

    getAllProducts() {
        return new Observable(subscriber => {
            ProductsModel.find({}).sort('-creationDate').exec((err, products) => {
                if (err) subscriber.error(err);
                subscriber.next(products);
            });
        });
    }

    getProductsByIdStore(id_store) {
        return new Observable(subscriber => {
            ProductsModel.find({store_id: id_store}).sort('-creationDate').exec((err, products) => {
                if (err) subscriber.error(err);
                subscriber.next(products);
            });
        });
    }

    getProductById(product_id) {
        return new Observable(subscriber => {
            ProductsModel.find({_id: product_id}).exec((err, product) => {
                if (err) subscriber.error(err);
                subscriber.next(product);
            });
        });
    }

    activateProductById(product_id, active) {
        return new Observable(subscriber => {
            ProductsModel.findOneAndUpdate(
                { _id: product_id },
                { active: active },
                {new:true},
                (err, product) => {
                    if (err) subscriber.error(err);
                    console.log(product);
                    subscriber.next(product);
                }
            );
        });
    }

    deleteProductById(product_id) {
        return new Observable(subscriber => {
            ProductsModel.deleteOne({ _id: product_id }, function (err, product) {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se elimino con exito.', product: product});
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
                console.log(operation_type);
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newProduct = new ProductsModel(product);
                    newProduct.save((err, addedProduct) => {
                        if (err) subscriber.error(err);
                        subscriber.next(addedProduct);
                        console.log(addedProduct);
                    });
                } else {
                    let product_id = product._id;
                    delete product._id;
                    console.log(product);
                    ProductsModel.findOneAndUpdate(
                        { _id: product_id },
                        product,
                        (err, product) => {
                            if (err) subscriber.error(err);
                            subscriber.next(product);
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
  