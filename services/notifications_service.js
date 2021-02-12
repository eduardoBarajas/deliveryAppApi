const PUSH_NOTIFICATIONS_TYPES = require('../utils/pushNotificationsTypes');
const USER_ROLES = require('../utils/users_roles');
const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const UserModel = require('../models/user');
const moment = require('moment');

class NotificationsService {
    
    constructor () {

    }

    getUsersIds(params) {
        return new Observable(subscriber => {
            switch (params.type) {
                case PUSH_NOTIFICATIONS_TYPES.SEND_TO_ALL_DELIVERY_USERS: {
                    UserModel.find({userRole: USER_ROLES.DELIVERY_USER, isSubscribedToPushNotifications: true}, '_id').sort('-creationDate').exec((err, users) => {
                        if (err) subscriber.error(err);
                        if (users != null) {
                            subscriber.next(users.map((user) => {
                                return user._id;
                            }));
                        } else {
                            subscriber.next([]);
                        }
                    });
                    break;
                }
                case PUSH_NOTIFICATIONS_TYPES.SEND_TO_ALL: {
                    UserModel.find({isSubscribedToPushNotifications: true}, '_id').sort('-creationDate').exec((err, users) => {
                        if (err) subscriber.error(err);
                        if (users != null) {
                            subscriber.next(users.map((user) => {
                                return user._id;
                            }));
                        } else {
                            subscriber.next([]);
                        }
                    });
                    break;
                }
                case PUSH_NOTIFICATIONS_TYPES.SEND_ONLY_TO_USERS_LIST: {
                    subscriber.next([]);
                    break;
                }
                case PUSH_NOTIFICATIONS_TYPES.SEND_TO_ALL_DELIVERY_USERS_BY_STORE_OWNER: {
                    UserModel.find({isSubscribedToPushNotifications: true, userRole: USER_ROLES.DELIVERY_USER, creatorUserId: params.users[0]}, '_id').sort('-creationDate').exec((err, users) => {
                        if (err) subscriber.error(err);
                        if (users != null) {
                            subscriber.next(users.map((user) => {
                                return user._id;
                            }));
                        } else {
                            subscriber.next([]);
                        }
                    });
                    break;
                }
            }
            
        });
    }
}

module.exports = new NotificationsService();