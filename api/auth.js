var express = require('express');
var router = express.Router();
const AuthService = require('../services/auth_service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;

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

router.post('/updateUserPushNotificationSubscription', function (req, res, next) {
    let userId = req.body.userId;
    let subscription = req.body.subscription;
    AuthService.saveUser({_id: userId, isSubscribedToPushNotifications: subscription}).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /updateUserPushNotificationSubscription/ : ' + err); res.status(500).send({ err : err}); }
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
                next(response) { res.send(response); },
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
