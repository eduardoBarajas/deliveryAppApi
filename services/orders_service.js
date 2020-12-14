const ORDER_STATES = require('../utils/order_states');
const USER_ROLES = require('../utils/users_roles');
const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const OrdersModel = require('../models/order');
const ProductsModel = require('../models/product');
const moment = require('moment');


class OrdersService {
    
    constructor () {

    }

    getCartByIdUser(idUser) {
        console.log({idUser: idUser, state: ORDER_STATES.CART});
        return new Observable(subscriber => {
            OrdersModel.findOne({consumerUserId: idUser, state: ORDER_STATES.CART}, (err, cart) => {
                if (err) subscriber.error(err);
                console.log(cart);
                if (cart != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvo el carrito con exito.', order: cart});
                } else {
                    subscriber.next({status: 'warning', message: 'No tiene nada en el carrito.'});
                }
            });
        });
    }

    getCartDataByIdUser(idUser) {
        return new Observable(subscriber => {
            let data = {status: 'warning', message: 'No se encontraron productos en el carrito.', products: [], store: null, idOrder: ''};
            OrdersModel.findOne({consumerUserId: idUser, state: ORDER_STATES.CART}, (err, cart) => {
                if (err) subscriber.error(err);
                if (cart != null) {
                    cart.items.forEach((value, key, map) => {
                        ProductsModel.findOne({_id: key}, (errProduct, product) => {
                            if (errProduct) subscriber.error(errProduct);
                            if (product != null) {
                                data.products.push({product: product, quantity: value});
                                // checamos que ya se haya obtenido el ultimo registro del arreglo.
                                if (data.products.length == cart.items.size) {
                                    if (data.products.length > 0) {
                                        data = {...data, status: 'success', message: 'Se obtuvieron los productos con exito.', idOrder: cart._id};
                                    }
                                    StoresModel.findOne({_id: product.store_id}, (errStore, store) => {
                                        if (errStore) subscriber.error(errStore);
                                        if (store != null) {
                                            data.store = store;
                                            subscriber.next(data);
                                        }
                                    });
                                }
                            }
                        });
                    });
                } else {
                    subscriber.next({status: 'warning', message: 'No se encontro el carrito, intenta mas tarde.'});
                }
            });
        });
    }

    getCartById(idOrder) {
        return new Observable(subscriber => {
            OrdersModel.findOne({_id: idOrder, state: ORDER_STATES.CART}, (err, cart) => {
                if (err) subscriber.error(err);
                if (cart != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvo el carrito con exito.', order: cart});
                } else {
                    subscriber.next({status: 'warning', message: 'No tiene nada en el carrito.'});
                }
            });
        });
    }

    getOrderWithDataById(idOrder) {
        return new Observable(subscriber => {
            OrdersModel.findOne({_id: idOrder}).populate('consumerUserId').populate('deliveryUserId').populate('storeId').exec((err, order) => {
                if (err) subscriber.error(err);
                if (order != null) {
                    subscriber.next({status: 'success', message: 'Se obtuvo la orden con exito.', orderWithData: order});
                } else {
                    subscriber.next({status: 'warning', message: 'No se encontro la orden.'});
                }
            });
        });
    }

    getOrdersByIdUserAndRole(idUser, role) {
        return new Observable(subscriber => {
            const execute = (params) => { 
                OrdersModel.find(params).populate('consumerUserId').populate('deliveryUserId').populate('storeId').exec((err, orders) => {
                    if (err) subscriber.error(err);
                    if (orders != null) {
                        console.log(orders);
                        subscriber.next({status: 'success', message: 'Se obtuvieron las ordenes con exito.', ordersWithData: orders});
                    } else {
                        subscriber.next({status: 'warning', message: 'No se han hecho ordenes con esta cuenta.'});
                    }
                });
            }
            let query_params = {};
            switch (role.toUpperCase()) {
                case USER_ROLES.CLIENT_USER: {
                    query_params.consumerUserId = idUser;
                    query_params.state = { $gt: ORDER_STATES.CART};
                    execute(query_params);
                    break;
                }
                case USER_ROLES.STORE_OWNER: { 
                    StoresModel.find({storeOwnerId: idUser}).exec((err, stores) => {
                        if (err) subscriber.error(err);
                        console.log(stores);
                        let id_stores = [];
                        stores.forEach((store) => {
                            id_stores.push(store._id);
                        });
                        query_params.state = { $gt: ORDER_STATES.CART};
                        query_params.storeId = { $in: id_stores };
                        execute(query_params);
                    });
                    break; 
                }
                case USER_ROLES.DELIVERY_USER: { 
                    query_params.deliveryUserId = { $in: [idUser, null] }; 
                    query_params.state = { $gt: ORDER_STATES.SEND_TO_STORE};
                    execute(query_params);
                    break; 
                }
            }
            
        });
    }

    updateCart(order) {
        console.log(order);
        return new Observable(subscriber => {
            OrdersModel.findOneAndUpdate({ _id: order._id }, order, {new: true}, function (err, cart) {
                if (err) subscriber.error(err);
                if (cart != null) {
                    subscriber.next({status: 'success', message: 'Se actualizo el carrito con exito.', order: cart});
                } else {
                    subscriber.next({status: 'warning', message: 'Ocurrio un problema al actualizar el carrito intenta mas tarde.'});
                }
            });
        });
    }

    updateOrderState(order) {
        console.log(order); 
        let updated_data = {state: order.state + 100};
        if (order.deliveryUserId != null && order.deliveryUserId.length > 0)
            updated_data.deliveryUserId = order.deliveryUserId;
        console.log(updated_data);
        return new Observable(subscriber => {
            OrdersModel.findOneAndUpdate({ _id: order._id }, updated_data, {new: true}, function (err, order) {
                if (err) subscriber.error(err);
                console.log(order);
                if (order != null) {
                    subscriber.next({status: 'success', message: 'Se actualizo la orden con exito.', order: order});
                } else {
                    subscriber.next({status: 'warning', message: 'Ocurrio un problema al actualizar la orden intenta mas tarde.'});
                }
            });
        });
    }

    saveOrder(order) {
        console.log(order);
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (order._id == '') {
                    // si es nulo es por que es una nueva orden.
                    order._id = mongoose.Types.ObjectId();
                    // se agrega un id cualquiera en el usuario de delivery, cuando se
                    // cambie de estado la orden se debera reasignar.
                    order.creationDate = moment(new Date());
                    if (order.state == '')
                        order.state = ORDER_STATES.CART;
                    if (order.deliveryUserId == '')
                        delete order.deliveryUserId;
                    if (order.storeId == '')
                        delete order.storeId;
                    operation_type = 'Save';
                } else {
                    order.creationDate = moment(order.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newOrder = new OrdersModel(order);
                    newOrder.save((err, addedOrder) => {
                        if (err) subscriber.error(err);
                        subscriber.next({status: 'success', message: 'Se agrego con exito.', order: newOrder});
                    });
                } else {
                    let order_id = order._id;
                    delete order._id;
                    OrdersModel.findOne({ _id: order_id }, (err, mOrder) => {
                        if (err) subscriber.error(err);
                        console.log(mOrder);
                        if (mOrder != null) {
                            mOrder.deliverUserId = order.deliverUserId;
                            mOrder.state = order.state;
                            mOrder.address = order.address;
                            mOrder.addressCoord = order.addressCoord;
                            mOrder.payId = order.payId;
                            mOrder.save((err, savedOrder) => {
                                if (err) subscriber.error(err);
                                subscriber.next({status: 'success', message: 'Se modifico con exito.', order: savedOrder});
                            });
                        } else {
                            subscriber.error(err);
                        }
                    });
                }
            } catch(e) {
                subscriber.error(e);
            }
        });
    }
}

module.exports = new OrdersService();