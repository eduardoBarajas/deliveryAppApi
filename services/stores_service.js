const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const ReviewsModel = require('../models/review');
const moment = require('moment');

class StoreService {
    
    constructor () {

    }

    getStoresByIdStore() {
        return new Observable(subscriber => {
            StoresModel.find({}).sort('-creationDate').exec((err, stores) => {
                if (err) subscriber.error(err);
                subscriber.next(stores.filter((store => {
                    console.log(store);
                    return (!store.deleted);
                })));
            });
        });
    }

    getStoreById(store_id) {
        return new Observable(subscriber => {
            StoresModel.find({_id: store_id}).exec((err, store) => {
                if (err) subscriber.error(err);
                subscriber.next(store);
            });
        });
    }

    activateStoreById(store_id, active) {
        return new Observable(subscriber => {
            StoresModel.findOneAndUpdate(
                { _id: store_id },
                { active: active },
                {new:true},
                (err, store) => {
                    if (err) subscriber.error(err);
                    console.log(store);
                    subscriber.next(store);
                }
            );
        });
    }

    deleteStoreById(store_id) {
        return new Observable(subscriber => {
            StoresModel.findOneAndUpdate({ _id: store_id }, {deleted: true}, {new:true}, function (err, store) {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se elimino con exito.', store: store});
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
                console.log(operation_type);
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newStore = new StoresModel(store);
                    newStore.save((err, addedStore) => {
                        if (err) subscriber.error(err);
                        subscriber.next(addedStore);
                        console.log(addedStore);
                    });
                } else {
                    let store_id = store._id;
                    delete store._id;
                    console.log(store);
                    StoresModel.findOneAndUpdate(
                        { _id: store_id },
                        store,
                        (err, store) => {
                            if (err) subscriber.error(err);
                            subscriber.next(store);
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
  