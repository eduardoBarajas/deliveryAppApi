const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const FavoritesModel = require('../models/favorite');
const moment = require('moment');

class FavoritesService {
    
    constructor () {

    }

    getAllFavoritesByIdUserAndType(idUser, type) {
        return new Observable(subscriber => {
            FavoritesModel.find({idUser: idUser, type: type}).sort('-creationDate').exec((err, favs) => {
                if (err) subscriber.error(err);
                if (favs.length > 0) {
                    subscriber.next({status: 'success', message: 'Se obtuvieron los favoritos con exito.', favorites: favs});
                } else {
                    subscriber.next({status: 'warning', message: 'No hay favoritos.'});
                }
            });
        });
    }

    getFavoriteByIdUserAndIdElement(idUser, idElement) {
        return new Observable(subscriber => {
            FavoritesModel.find({idUser: idUser, likedElementId: idElement}).sort('-creationDate').exec((err, favs) => {
                if (err) subscriber.error(err);
                if (favs.length > 0) {
                    subscriber.next({status: 'success', message: 'Se obtuvieron los favoritos con exito.', favorite: favs[0]});
                } else {
                    subscriber.next({status: 'warning', message: 'No hay favoritos.'});
                }
            });
        });
    }

    deleteFavorite(idFavorite) {
        return new Observable(subscriber => {
            FavoritesModel.deleteOne({ _id: idFavorite }, function (err, fav) {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se elimino con exito.', favorite: fav});
            });
        });
    }

    saveFavorite(favorite) {
        console.log(favorite);
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (favorite._id == '') {
                    // si es nulo es por que es una nueva tienda.
                    favorite._id = mongoose.Types.ObjectId();
                    favorite.creationDate = moment(new Date());
                    operation_type = 'Save';
                } else {
                    favorite.creationDate = moment(favorite.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newFav = new FavoritesModel(favorite);
                    newFav.save((err, addedFavorite) => {
                        if (err) subscriber.error(err);
                        subscriber.next({status: 'success', message: 'Se agrego a favoritos.', favorite: addedFavorite});
                    });
                } else {
                    let favorite_id = favorite._id;
                    delete favorite._id;
                    FavoritesModel.findOneAndUpdate(
                        { _id: favorite_id },
                        favorite,
                        {new:true},
                        (err, newFav) => {
                            if (err) subscriber.error(err);
                            subscriber.next({status: 'success', message: `Se ${(!newFav.liked) ? 'quito de favoritos' : 'agrego a favoritos'}.`, favorite: newFav});
                        }
                    );
                }
            } catch(e) {
                subscriber.error(err);
            }
        });
    }
}

module.exports = new FavoritesService();