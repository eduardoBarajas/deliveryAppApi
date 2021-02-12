const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const UserModel = require('../models/user');
const AccountValidationCodeModel = require('../models/accountValidationCode');
const moment = require('moment');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const ROLES = require('../utils/users_roles');
const saltRounds = 12;

class AuthService {
    
    constructor () {

    }

    generateAccountValidationCode(email) {
        return new Observable(subscriber => {
            let generated_code = crypto.randomBytes(5).toString('hex');
            bcrypt.hash(generated_code, saltRounds, function(err, hash) {
                const code = new AccountValidationCodeModel({_id: mongoose.Types.ObjectId(), email: email, creationDate: moment(new Date()), expiredDate: moment(new Date()).add(5, 'minutes'), code: hash});
                code.save((err, code) => {
                    if (err) subscriber.error(err);
                    if (code != null) {
                        code.code = generated_code;
                        subscriber.next({status: 'success', message: 'Se se genero el codigo con exito.', code: code});
                    } else {
                        subscriber.next({status: 'warning', message: 'No se pudo generar el codigo.'});
                    }
                });
            });
        });
    }

    validateAccountValidationCode(email, code) {
        return new Observable(subscriber => {
            AccountValidationCodeModel.findOne({email: email}).sort('-creationDate').exec((err, val_code) => {
                if (err) subscriber.error(err);
                if (val_code != null) {
                    if (val_code.attemps < 3) {
                        // mejora ----- Agregar validacion para revisar que no este expirada la solicitud.
                        bcrypt.compare(code, val_code.code, function(err, result) {
                            if (result) {
                                subscriber.next({status: 'success', message: 'Se valido el codigo con exito'});
                            } else {
                                AccountValidationCodeModel.findOneAndUpdate({_id: val_code._id}, {attemps: val_code.attemps + 1}, (errActualizado, new_valcode) => {
                                    if (errActualizado) {
                                        subscriber.error(err);
                                    }
                                    subscriber.next({status: 'warning', message: 'Codigo incorrecto te quedan ' + (3 - (val_code.attemps + 1)) + ' intentos'});
                                });
                            }
                        });
                    } else {
                        subscriber.next({status: 'warning', message: 'El codigo de validacion ya no es valido, solicita otro'});
                    }
                } else {
                    subscriber.next({status: 'warning', message: 'No se encontro un codigo de validacion'});
                }
            });
        });
    }

    getUserByEmail(email) {
        return new Observable(subscriber => {
            UserModel.findOne({email: email, deleted: false}).sort('-creationDate').exec((err, user) => {
                if (err) subscriber.error(err);
                if (user != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvo el usuario con exito.', user: user});
                } else {
                    subscriber.next({status: 'warning', message: 'No existe un usuario con ese correo en el sistema.'});
                }
            });
        });
    }

    checkIfEmailExists(email) {
        return new Observable(subscriber => {
            UserModel.findOne({email: email}).sort('-creationDate').exec((err, user) => {
                if (err) subscriber.error(err);
                if (user != null) {
                    subscriber.next({status: 'warning', message: 'Ya existe un usuario con ese correo en el sistema.', user: {_id: user._id, email: user.email}});
                } else {
                    subscriber.next({status: 'success', message: 'No existe un usuario con ese correo en el sistema.'});
                }
            });
        });
    }

    checkIfAccountWithTelNumberExists(phone) {
        return new Observable(subscriber => {
            UserModel.findOne({phone: phone}).sort('-creationDate').exec((err, user) => {
                if (err) subscriber.error(err);
                if (user != null) {
                    subscriber.next({status: 'warning', message: 'Ya existe un usuario con ese numero de telefono en el sistema.', user: {_id: user._id, phone: user.phone}});
                } else {
                    subscriber.next({status: 'success', message: 'No existe un usuario con ese numero de telefono en el sistema.'});
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

    getAllUsersByRole(role) {
        return new Observable(subscriber => {
            UserModel.find({userRole: role, deleted: false}).sort('-creationDate').exec((err, users) => {
                if (err) subscriber.error(err);
                if (users != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvieron los usuarios de ese rol con exito.', users: users});
                } else {
                    subscriber.next({status: 'warning', message: 'No existen usuarios con ese rol.'});
                }
            });
        });   
    }

    updateUserPassword(email, newPassword) {
        return new Observable(subscriber => {
            UserModel.findOneAndUpdate(
                { email: email },
                { password: newPassword },
                {new:true},
                (err, newUser) => {
                    if (err) subscriber.error(err);
                    if (newUser != null) {
                        subscriber.next({status: 'success', message: `Se actualizo la contrasena con exito.`});
                    } else {
                        subscriber.next({status: 'warning', message: `No se pudieron actualizaron la contrasena intente mas tarde.`});
                    }
                }
            );
        }); 
    }

    deleteUserById(idUser) {
        return new Observable(subscriber => {
            UserModel.findOneAndUpdate({ _id: idUser}, {deleted: true}, function (err, user) {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se elimino con exito.', user: user});
            });
        });
    }

    getCostumersByIdStoreOwner(idStoreOwner) {
        return new Observable(subscriber => {
            UserModel.find({creatorUserId: idStoreOwner, userRole: ROLES.CONSUMER_USER, deleted: false}).sort('-creationDate').exec((err, users) => {
                if (err) subscriber.error(err);
                if (users != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvieron los usuario con exito.', users: users});
                } else {
                    subscriber.next({status: 'warning', message: 'No ha creado usuarios.'});
                }
            });
        });
    }

    getDeliverDriversByIdStoreOwner(idStoreOwner) {
        return new Observable(subscriber => {
            UserModel.find({creatorUserId: idStoreOwner, userRole: ROLES.DELIVERY_USER, deleted: false}).sort('-creationDate').exec((err, users) => {
                if (err) subscriber.error(err);
                if (users != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvieron los usuario con exito.', users: users});
                } else {
                    subscriber.next({status: 'warning', message: 'No ha creado usuarios.'});
                }
            });
        });
    }

    saveUser(user) {
        console.log(user);
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (user.creatorUserId == '')
                    delete user.creatorUserId;
                if (user._id == '') {
                    // si es nulo es por que es un nuevo usuario.
                    user._id = mongoose.Types.ObjectId();
                    user.creationDate = moment(new Date());
                    user.deleted = false;
                    operation_type = 'Save';
                } else {
                    user.creationDate = moment(user.creationDate);
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
                            subscriber.next({status: 'success', message: `Se actualizaron los datos con exito.`, user: newUser});
                        }
                    );
                }
            } catch(e) {
                subscriber.error(e);
            }
        });
    }
}

module.exports = new AuthService();