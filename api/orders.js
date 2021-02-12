var express = require('express');
const { response } = require('../app');
const order = require('../models/order');
var router = express.Router();
const { env } = require('process');
const OrdersService = require('../services/orders_service');
const ProductsService = require('../services/products_service');
const StoresService = require('../services/stores_service');
const mercadopago = require('mercadopago');

router.post('/payWithMercadoPago', function(req, res, next) {
    console.log('body');
    console.log(req.body);
    var payment_data = {
        transaction_amount: Number(req.body.transaction_amount),
        token: req.body.token,
        description: 'Es una prueba',//req.body.description,
        installments: Number(req.body.installments),
        payment_method_id: req.body.payment_method_id,
        issuer_id: req.body.issuer_id,
        payer: {
            email: req.body.payer.email,
        }
    };
    console.log(payment_data);
    
    mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_ACCESS_TOKEN);
    mercadopago.payment.save(payment_data)
    .then(function(response) {
        res.status(response.status).json({
            status: response.body.status,
            status_detail: response.body.status_detail,
            id: response.body.id
        });
    })
    .catch(function(error) {
        console.log(error);
        res.status(500).send(error);
    });
});

router.get('/getCartByIdUser/:idUser', function(req, res, next) {
    let id_user = req.params.idUser;
    OrdersService.getCartByIdUser(id_user).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getCartByIdUser: ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getCartDataByIdUser/:idUser', function(req, res, next) {
    let id_user = req.params.idUser;
    OrdersService.getCartDataByIdUser(id_user).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getCartDataByIdUser: ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/clearCart/:idOrder', function(req, res, next) {
    let idOrder = req.params.idOrder;
    let order = {_id: idOrder, items: new Map()};
    OrdersService.updateCart(order).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /clearCart/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/updateCart', function(req, res, next) {
    let idOrder = req.body.idOrder;
    let idItem = req.body.idItem;
    let new_quantity = parseInt(req.body.quantity);
    let updateType= req.body.updateType;
    let idComplement = req.body.idComplement;
    if (idComplement != null && idComplement != '') updateType = 'PRODUCT_COMPLEMENT_' + updateType;
    const update_cart =  { next(responseOrder) { res.send(responseOrder); }, error(err) { console.error('ERROR: //updateCart/:idOrder/:idItem/:quantity/:updateType/ : updateCart : ' + err); res.status(500).send({ err : err}); }};
    OrdersService.getCartById(idOrder).subscribe({
        next(response_cart) { 
            if (response_cart.status == 'success') {
                switch (updateType.toUpperCase()) {
                    case 'ADD': {
                        response_cart.order.items.set(idItem, (response_cart.order.items.get(idItem) != null) ? response_cart.order.items.get(idItem) + new_quantity : new_quantity);
                        break;
                    }
                    case 'REMOVE': {
                        response_cart.order.items.set(idItem, (response_cart.order.items.get(idItem) != null) ? ((response_cart.order.items.get(idItem) - new_quantity) < 0) ? 0 : response_cart.order.items.get(idItem) - new_quantity : 0);
                        break;
                    }
                    case 'DELETE': {
                        // revisamos si el elemento tenia complementos asignados para entonces quitarlos.
                        response_cart.order.itemsComplements = response_cart.order.itemsComplements.filter(({productId, id, quantity}) => {
                            return (idItem != productId);
                        });
                        if (response_cart.order.items.get(idItem) != null) response_cart.order.items.delete(idItem);
                        if (response_cart.order.items.size == 0) response_cart.order.storeId = null;
                        OrdersService.updateCart(response_cart.order).subscribe(update_cart);
                        break;
                    }
                    case 'PRODUCT_COMPLEMENT_ADD': {
                        // revisamos si la orden tiene complementos.
                        if (response_cart.order.itemsComplements.length > 0) {
                            // si ya tiene entonces obtenemos el complemento a agregar.
                            let complements = response_cart.order.itemsComplements.filter(({productId, id, quantity}) => {
                                return (idItem == productId && idComplement == id);
                            });
                            if (complements.length > 0) {
                                response_cart.order.itemsComplements = response_cart.order.itemsComplements.map(({productId, id, quantity}) => {
                                    let complement = {productId: productId, id: id, quantity: quantity};
                                    if (idItem == complement.productId && idComplement == complement.id) {
                                        complement.quantity += new_quantity;
                                    }
                                    return complement;
                                });
                            } else {
                                // si el nuevo complemento no existia antes entonces agregamos.
                                response_cart.order.itemsComplements.push({productId: idItem, id: idComplement, quantity: new_quantity});
                            }
                        } else {
                            // si no tiene simplemente agregamos a la lista.
                            response_cart.order.itemsComplements.push({productId: idItem, id: idComplement, quantity: new_quantity});
                        }
                        break;
                    }
                    case 'PRODUCT_COMPLEMENT_REMOVE': {
                        let complements = response_cart.order.itemsComplements.filter(({productId, id, quantity}) => {
                            return (idItem == productId && idComplement == id);
                        });
                        if (complements.length > 0) {
                            response_cart.order.itemsComplements = response_cart.order.itemsComplements.map(({productId, id, quantity}) => {
                                let complement = {productId: productId, id: id, quantity: quantity};
                                if (idItem == productId && idComplement == id) {
                                    if ((complement.quantity - new_quantity) >= 0) {
                                        complement.quantity -= new_quantity;
                                    }
                                }
                                return complement;                                
                           });
                        }
                        break;
                    }
                    case 'PRODUCT_COMPLEMENT_DELETE': {
                        response_cart.order.itemsComplements = response_cart.order.itemsComplements.filter(({productId, id, quantity}) => {
                            return (idComplement != id);
                        });
                        break;
                    }
                }
                if (!updateType.toUpperCase().includes('PRODUCT_COMPLEMENT')) {
                    if (updateType.toUpperCase() != 'DELETE') {
                        ProductsService.getProductById(idItem).subscribe({
                            next(response_item) { 
                                if (response_item.status == 'success') {
                                    if (response_cart.order.storeId == null || response_cart.order.storeId == '') {
                                        response_cart.order.storeId = response_item.product.store_id;
                                        OrdersService.updateCart(response_cart.order).subscribe(update_cart);
                                    } else {
                                        if (response_cart.order.storeId.equals(response_item.product.store_id)) {
                                            OrdersService.updateCart(response_cart.order).subscribe(update_cart);
                                        } else {
                                            // si no son del mismo local entonces regresamos un warning.
                                            res.send({status: 'warning', message: 'No puedes agregar productos de dos locales distintos al pedido, completa o elimina el pedido actual.'});
                                        }
                                    }
                                }
                            }, error(err) { console.error('ERROR: /addItemToCart/ : getProductById : ' + err); res.status(500).send({ err : err}); }
                        });   
                    }
                } else {
                    OrdersService.updateCart(response_cart.order).subscribe(update_cart);
                }   
            }
        }, error(err) { console.error('ERROR: //updateCart/:idOrder/:idItem/:quantity/:updateType/ : getCartById : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/getOrderWithDataById', function(req, res, next) {
    let idOrder = req.body.idOrder;
    OrdersService.getOrderWithDataById(idOrder).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getOrderWithDataById : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/getOrdersByIdUserAndRole', function(req, res, next) {
    let idUser = req.body.idUser;
    let role = req.body.role;
    OrdersService.getOrdersByIdUserAndRole(idUser, role).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getOrdersByIdUserAndRole : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/updateOrderState', function(req, res, next) {
    let order = req.body.order;
    OrdersService.updateOrderState(order).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /updateOrderState : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/saveOrder', function(req, res, next) {
    let items = req.body.items;
    let order = req.body.order;
    order.items = new Map();
    Object.keys(items).forEach(key => {
        order.items.set(key, items[key]);
    });
    OrdersService.saveOrder(order).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /saveOrder : ' + err); res.status(500).send({ err : err}); }
    });
});

module.exports = router;
