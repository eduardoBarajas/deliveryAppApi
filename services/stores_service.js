const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const ReviewsModel = require('../models/review');
const ProductsModel = require('../models/product');
const moment = require('moment');
const e = require('express');
const store = require('../models/store');

class StoreService {
    
    constructor () {

    }

    getStoresByIdStoreOwner(id_store_owner) {
        // aqui agregar el id del store owner en la consulta
        console.log(id_store_owner);
        return new Observable(subscriber => {
            StoresModel.find({storeOwnerId: id_store_owner}).sort('-creationDate').exec((err, stores) => {
                if (err) subscriber.error(err);
                if (stores != null) {
                    subscriber.next(stores.filter((store => {
                        return (!store.deleted);
                    })));
                } else {
                    subscriber.next([]);
                }
            });
        });
    }

    getAllStores(onlyActive) {
        return new Observable(subscriber => {
            let query_params = {deleted: false};
            if (onlyActive == 'true') query_params.active = true;
            console.log(onlyActive);
            console.log(query_params);
            StoresModel.find(query_params).sort('-creationDate').exec((err, stores) => {
                if (err) subscriber.error(err);
                subscriber.next(stores);
            });
        });
    }

    getStoreById(store_id) {
        return new Observable(subscriber => {
            StoresModel.findOne({_id: store_id}).exec((err, store) => {
                if (err) subscriber.error(err);
                console.log(store);
                subscriber.next({status: 'success', message: 'Se ha obtenido la tienda con exito.', store: store});
            });
        });
    }

    activateStoreById(store_id, active) {
        return new Observable(subscriber => {
            ProductsModel.countDocuments({store_id: store_id}, (err, products_count) => {
                if (products_count > 0) {
                    StoresModel.findOneAndUpdate({ _id: store_id }, { active: active }, {new:true}, (err, store) => {
                        if (err) subscriber.error(err);
                        if (store.active == false) {
                            ProductsModel.updateMany({store_id: store_id, active: true}, {active: false}, (err, products) => {
                                if (err) subscriber.error(err);
                                subscriber.next({status: 'warning', message: 'La tienda y todos sus productos han sido desactivados.', store: store});
                            });
                        } else {
                            ProductsModel.countDocuments({store_id: store_id}, (err, products_count) => {
                                ProductsModel.updateMany({store_id: store_id, active: false}, {active: true}, (err, products) => {
                                    if (err) subscriber.error(err);
                                    subscriber.next({status: 'success', message: 'La tienda y todos sus productos han sido activados.', store: store});
                                });
                            });
                        }
                    });
                } else {
                    subscriber.next({status: 'warning', message: 'La tienda debe tener al menos un producto para ser activada.'});
                }
            });
        });
    }

    deleteStoreById(store_id) {
        return new Observable(subscriber => {
            // desactivamos todos los productos de la tienda.
            ProductsModel.updateMany({store_id: store_id, active: true}, {active: false}, (err, products) => {
                if (err) subscriber.error(err);
                StoresModel.findOneAndUpdate({ _id: store_id }, {deleted: true}, {new:true}, function (err, store) {
                    if (err) subscriber.error(err);
                    subscriber.next({status: 'success', message: 'Se elimino con exito.', store: store});
                });
            });
        });
    }

    saveStore(store) {
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (store._id == '') {
                    // si es nulo es por que es una nueva tienda.
                    store._id = mongoose.Types.ObjectId();
                    store.creationDate = moment(new Date());
                    store.deleted = false;
                    operation_type = 'Save';
                } else {
                    store.creationDate = moment(store.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newStore = new StoresModel(store);
                    newStore.save((err, addedStore) => {
                        if (err) subscriber.error(err);
                        subscriber.next({status: 'success', message: 'Se agrego la tienda con exito.', store: addedStore});
                    });
                } else {
                    let store_id = store._id;
                    delete store._id;
                    StoresModel.findOneAndUpdate(
                        { _id: store_id },
                        store,
                        (err, store) => {
                            if (err) subscriber.error(err);
                            subscriber.next({status: 'success', message: 'Se actualizo la tienda con exito.', store: store});
                        }
                    );
                }
            } catch(e) {
                subscriber.error(err);
            }
        });
    }

}

module.exports = new StoreService();
  