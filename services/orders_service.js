const ORDER_STATES = require('../utils/order_states');
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
            OrdersModel.findOne({creatorUserId: idUser, state: ORDER_STATES.CART}, (err, cart) => {
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
            let data = {status: 'warning', message: 'No se encontraron productos en el carrito.', products: [], idOrder: ''};
            OrdersModel.findOne({creatorUserId: idUser, state: ORDER_STATES.CART}, (err, cart) => {
                if (err) subscriber.error(err);
                if (cart != null) {
                    cart.items.forEach((value, key, map) => {
                        ProductsModel.findOne({_id: key}, (errProduct, product) => {
                            if (errProduct) subscriber.error(errProduct);
                            if (product != null) {
                                StoresModel.findOne({_id: product.store_id}, (errStore, store) => {
                                    if (errStore) subscriber.error(errStore);
                                    if (store != null) {
                                        data.products.push({product: product, store: store, quantity: value});
                                    }
                                    // checamos que ya se haya obtenido el ultimo registro del arreglo.
                                    if (data.products.length == cart.items.size) {
                                        if (data.products.length > 0) {
                                            data = {...data, status: 'success', message: 'Se obtuvieron los productos con exito.', idOrder: cart._id};
                                        }
                                        subscriber.next(data);
                                    }
                                });
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
                    order.state = ORDER_STATES.CART;
                    operation_type = 'Save';
                } else {
                    order.creationDate = moment(order.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    if (order.consumerUserId == '')
                        order.consumerUserId = order.creatorUserId;
                    const newOrder = new OrdersModel(order);
                    newOrder.deliveryUserId = mongoose.Types.ObjectId();
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