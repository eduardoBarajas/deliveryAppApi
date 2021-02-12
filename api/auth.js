var express = require('express');
var router = express.Router();
const AuthService = require('../services/auth_service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { env } = require('process');
const path = require('path');
const saltRounds = 12;

router.post('/requestAccountValidationCode/:email', function(req, res, next) {
    let email = req.params.email;
    AuthService.checkIfEmailExists(email).subscribe({
        next(resp) { 
            if (resp.status == 'warning') {
                AuthService.generateAccountValidationCode(email).subscribe({
                    next(response) { 
                        if (response.status == 'success') {
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: process.env.app_email,
                                    pass: process.env.app_email_pass
                                }
                            });
                            const mailOptions = {
                                from: process.env.app_email,
                                to: email,
                                subject: 'Codigo Activacion De Cuenta',
                                text: 'El codigo para activar la cuenta es: ' + response.code.code
                            };
                              
                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                  console.log(error);
                                } else {
                                  console.log('Email sent: ' + info.response);
                                }
                            });
                        }
                        res.send(response); 
                    },
                    error(err) { console.error('ERROR: /generateAccountValidationCode/ : ' + err); res.status(500).send({ err : err}); }
                });
            } else {
                res.send({status: 'warning', message: 'No se encontro un usuario con ese email.'}); 
            }
        },
        error(err) { console.error('ERROR: /checkIfEmailExists/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/validateAccountValidationCode/:email/:code', function(req, res, next) {
    let email = req.params.email;
    let code = req.params.code;
    AuthService.validateAccountValidationCode(email, code).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /validateAccountValidationCode/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/verificarCuenta/:email/:code', function(req, res, next) {
    let email = req.params.email;
    let code = req.params.code;
    AuthService.validateAccountValidationCode(email, code).subscribe({
        next(response) {
            if (response.status == 'success') {
                AuthService.getUserByEmail(email).subscribe({
                    next(responseEmail) { 
                        if (responseEmail.status == 'success') {
                            if (!responseEmail.user.verified) {
                                let user = responseEmail.user;
                                user.verified = true;
                                AuthService.saveUser(user).subscribe({
                                    next(responseSave) { 
                                        if (responseSave.status == 'success') {
                                            res.render('accountVerification', {
                                                response: {status: 'Exito', message: 'La cuenta ha sido verificada con exito, ya puedes cerrar esta pestana'}
                                            });
                                        } else {
                                            res.render('accountVerification', {
                                                response: {status: 'Ocurrio un problema', message: 'La cuenta no pudo ser verificada en este momento, intenta de nuevo mas tarde'}
                                            });
                                        }
                                    },
                                    error(err) { 
                                        console.error('ERROR: /saveUser/ : ' + err); 
                                        res.render('accountVerification', {
                                            response: {status: 'Ocurrio un error', message: JSON.stringify(err)}
                                        }); 
                                    }
                                });
                            } else {
                                res.render('accountVerification', {
                                    response: {status: 'Exito', message: 'La cuenta asignada a este link ya ha sido verificada'}
                                }); 
                            }
                        } else {
                            res.render('accountVerification', {
                                response: {status: 'Ocurrio un problema', message: 'El usuario con ese correo no existe en el sistema'}
                            });
                        }
                    },
                    error(err) { 
                        console.error('ERROR: /validateAccountValidationCode/ : ' + err);
                        res.render('accountVerification', {
                            response: {status: 'Ocurrio un error', message: JSON.stringify(err)}
                        }); 
                    }
                });
            } else {
                res.render('accountVerification', {
                    response: {status: 'Ocurrio un problema', message: response.message, message2: 'Enlace invalido, solicita un nuevo codigo dentro de la seccion "Mi Perfil" dentro de la app'}
                });
            }
        },
        error(err) { 
            console.error('ERROR: /validateAccountValidationCode/ : ' + err);
            res.render('accountVerification', {
                response: {status: 'Ocurrio un error', message: JSON.stringify(err)}
            }); 
        }
    });
});

router.post('/updateUserPassword/:email/:code/:newPass', function(req, res, next) {
    let email = req.params.email;
    let code = req.params.code;
    let newPass = req.params.newPass;
    AuthService.validateAccountValidationCode(email, code).subscribe({
        next(response) { 
            if (response.status == 'success') {
                bcrypt.hash(newPass, saltRounds, function(err, hash) {
                    // Store hash in your password DB.
                    AuthService.updateUserPassword(email, hash).subscribe({
                        next(response) { res.send(response); },
                        error(err) { console.error('ERROR: /updateUserPassword/ : ' + err); res.status(500).send({ err : err}); }
                    });
                });
            } else {
                res.status(500).send({ err : err});
            }
        },
        error(err) { console.error('ERROR: /updateUserPassword/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/getUserById/:idUser', function(req, res, next) {
    console.log(req.session);
    let idUser = req.params.idUser;
    AuthService.getUserById(idUser).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getUserById/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/getAllUsersByRole', function(req, res, next) {
    let role = req.body.user_role;
    AuthService.getAllUsersByRole(role).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getAllUsersByRole/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/checkIfEmailExists', function (req, res, next) {
    let email = req.body.email;
    AuthService.checkIfEmailExists(email).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /checkIfEmailExists/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/checkIfAccountWithTelNumberExists', function (req, res, next) {
    let telNum = req.body.telNum;
    AuthService.checkIfAccountWithTelNumberExists(telNum).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /checkIfAccountWithTelNumberExists/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/updateUserPushNotificationSubscription', function (req, res, next) {
    let userId = req.body.userId;
    let subscription = req.body.subscription;
    AuthService.saveUser({_id: userId, isSubscribedToPushNotifications: subscription}).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /updateUserPushNotificationSubscription/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/createGuestUser', function(req, res, next) {
    let user = req.body.user;
    user.email = mongoose.Types.ObjectId().toHexString() + '_invitado@gmail.com';
    AuthService.saveUser(user).subscribe({
        next(response) {
            let _response = {...response};
            if (response.status == 'success') {
                _response.token = jwt.sign({ userId: response.user._id}, process.env.JWT_SECRET);
            } 
            res.send(_response) 
        },
        error(err) { console.error('ERROR: /saveUser/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/login', function(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    let keep_session_alive = req.body.keep_session_alive;
    if (email.length > 0 && password.length > 0) {
        AuthService.getUserByEmail(email).subscribe({
            next(response) { 
                if (response.status == 'success') {
                    if (response.user.deleted) {
                        let login_res = {status: 'warning', message: 'Este usuario ha sido dado de baja.'};
                        if (response.user.creatorUserId != null) {
                            login_res.message = 'El encargado del local donde estabas asignado te ha dado de baja.';
                        }
                        res.status(200).send(login_res);
                    } else {
                        bcrypt.compare(password, response.user.password, function(err, result) {
                            if (result) {
                                let login_res = {status: 'success', message: 'Se inicio sesion con exito.', userId: response.user._id};
                                // es valido.
                                // req.session.user = {idUser: response.user._id, role: response.user.userRole};
                                if (keep_session_alive == 'true') {
                                    // la sesion no expirara
                                    login_res.token = jwt.sign({ userId: response.user._id}, process.env.JWT_SECRET);    
                                } else {
                                    login_res.token = jwt.sign({userId: response.user._id}, process.env.JWT_SECRET, { expiresIn:  60});
                                }
                                res.status(200).send(login_res);
                            } else {
                                res.status(200).send({status: 'warning', message: 'Contrasena Incorrecta.'});
                            }
                        });
                    }
                } else {
                    res.status(200).send(response);
                }
            },
            error(err) { console.error('ERROR: /saveUser/ : ' + err); res.status(500).send({ err : err}); }
        });
    } else {
        res.status(200).send({status: 'warning', message: 'No haz ingresado los datos correctos.'});
    }
});

router.post('/getCostumersByIdStoreOwner', function(req, res, next) {
    console.log(req.session);
    let idStoreOwner = req.body.idStoreOwner;
    AuthService.getCostumersByIdStoreOwner(idStoreOwner).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getCostumersByIdStoreOwner/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/getDeliverDriversByIdStoreOwner', function(req, res, next) {
    console.log(req.session);
    let idStoreOwner = req.body.idStoreOwner;
    AuthService.getDeliverDriversByIdStoreOwner(idStoreOwner).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getDeliverDriversByIdStoreOwner/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/deleteUserById', function(req, res, next) {
    console.log(req.session);
    let idUser = req.body.idUser;
    AuthService.deleteUserById(idUser).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /deleteUserById/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/saveUser', function(req, res, next) {
    let user = req.body.user;
    let registrationData = null;
    if (req.body.registrationData != null)
        registrationData = req.body.registrationData;
    // si es diferente de null es que es registro.
    if (registrationData != null) {
        bcrypt.hash(registrationData.password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            user.password = hash;
            AuthService.saveUser(user).subscribe({
                next(response) { 
                    if (response.status == 'success') {
                        AuthService.generateAccountValidationCode(user.email).subscribe({
                            next(responseCode) { 
                                if (responseCode.status == 'success') {
                                    // si se creo el usuario entonces mandaremos el correo para verificar cuenta.
                                    const transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: process.env.app_email,
                                            pass: process.env.app_email_pass
                                        }
                                    });
                                    const mailOptions = {
                                        from: process.env.app_email,
                                        to: response.user.email,
                                        subject: 'Verificacion De Cuenta',
                                        text: 'Haz click en el siguiente enlace para verificar tu cuenta: ',
                                        html: '<a href="' + process.env.API_ADDRESS + 'auth/verificarCuenta/' + response.user.email + '/' + responseCode.code.code + '">Verificar Cuenta</a>'
                                    };
                                    
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                        console.log(error);
                                        } else {
                                        console.log('Email sent: ' + info.response);
                                        }
                                    });
                                }
                            },
                            error(err) { console.error('ERROR: /generateAccountValidationCode/ : ' + err); }
                        });
                    }
                    res.send(response); 
                },
                error(err) { console.error('ERROR: /saveUser/ : ' + err); res.status(500).send({ err : err}); }
            });
        });
    } else {
        AuthService.saveUser(user).subscribe({
            next(response) { res.send(response); },
            error(err) { console.error('ERROR: /saveUser/ : ' + err); res.status(500).send({ err : err}); }
        });
    }
});

module.exports = router;
