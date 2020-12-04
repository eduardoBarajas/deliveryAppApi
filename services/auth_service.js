const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const UserModel = require('../models/user');
const moment = require('moment');

class AuthService {
    
    constructor () {

    }

    getUserByEmail(email) {
        return new Observable(subscriber => {
            UserModel.findOne({email: email}).sort('-creationDate').exec((err, user) => {
                if (err) subscriber.error(err);
                if (user != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvo el usuario con exito.', user: user});
                } else {
                    subscriber.next({status: 'warning', message: 'No existe un usuario con ese correo en el sistema.'});
                }
            });
        });
    }

    getUserById(idUser) {
        return new Observable(subscriber => {
            UserModel.findOne({_id: idUser}).sort('-creationDate').exec((err, user) => {
                if (err) subscriber.error(err);
                if (user != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvo el usuario con exito.', user: user});
                } else {
                    subscriber.next({status: 'warning', message: 'No existe un usuario.'});
                }
            });
        });
    }

    saveUser(user) {
        console.log(user);
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (user._id == '') {
                    // si es nulo es por que es una nueva tienda.
                    user._id = mongoose.Types.ObjectId();
                    user.creationDate = moment(new Date());
                    operation_type = 'Save';
                } else {
                    user.creationDate = moment(favorite.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newUser = new UserModel(user);
                    newUser.save((err, addedUser) => {
                        if (err) subscriber.error(err);
                        subscriber.next({status: 'success', message: 'Se registro con exito.', user: addedUser});
                    });
                } else {
                    let user_id = user._id;
                    delete user.password;
                    delete user._id;
                    UserModel.findOneAndUpdate(
                        { _id: user_id },
                        user,
                        {new:true},
                        (err, newUser) => {
                            if (err) subscriber.error(err);
                            subscriber.next({status: 'success', message: `Se actualizaron los datos del usuario.`, user: newUser});
                        }
                    );
                }
            } catch(e) {
                subscriber.error(err);
            }
        });
    }
}

module.exports = new AuthService();