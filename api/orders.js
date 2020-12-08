var express = require('express');
const order = require('../models/order');
var router = express.Router();
const OrdersService = require('../services/orders_service');
const ProductsService = require('../services/products_service');
const StoresService = require('../services/stores_service');

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

router.post('/updateCart/:idOrder/:idItem/:quantity/:updateType', function(req, res, next) {
    let idOrder = req.params.idOrder;
    let idItem = req.params.idItem;
    let quantity = parseInt(req.params.quantity);
    let updateType= req.params.updateType;
    const update_cart =  { next(responseOrder) { res.send(responseOrder); }, error(err) { console.error('ERROR: /addItemToCart/ : updateCart : ' + err); res.status(500).send({ err : err}); }};
    OrdersService.getCartById(idOrder).subscribe({
        next(response_cart) { 
            if (response_cart.status == 'success') {
                switch (updateType.toUpperCase()) {
                    case 'ADD': {
                        response_cart.order.items.set(idItem, (response_cart.order.items.get(idItem) != null) ? response_cart.order.items.get(idItem) + quantity : quantity);
                        break;
                    }
                    case 'REMOVE': {
                        response_cart.order.items.set(idItem, (response_cart.order.items.get(idItem) != null) ? ((response_cart.order.items.get(idItem) - quantity) < 0) ? 0 : response_cart.order.items.get(idItem) - quantity : 0);
                        break;
                    }
                    case 'DELETE': {
                        if (response_cart.order.items.get(idItem) != null) response_cart.order.items.delete(idItem);
                        break;
                    }
                }            
                if (response_cart.order.items.get(idItem) != null && response_cart.order.stores.get(idItem) == undefined) {
                    ProductsService.getProductById(idItem).subscribe({
                        next(response_item) { 
                            if (response_item.status == 'success') {
                                response_cart.order.stores.set(idItem, response_item.product.store_id);
                                OrdersService.updateCart(response_cart.order).subscribe(update_cart);
                            }
                        }, error(err) { console.error('ERROR: /addItemToCart/ : getProductById : ' + err); res.status(500).send({ err : err}); }
                    });
                } else {
                    OrdersService.updateCart(response_cart.order).subscribe(update_cart);
                }
            }
        }, error(err) { console.error('ERROR: /addItemToCart/ : getCartById : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/saveOrder', function(req, res, next) {
    let items = req.body.items;
    let stores = req.body.stores;
    let order = req.body.order;
    order.items = new Map();
    order.stores = new Map();
    Object.keys(items).forEach(key => {
        order.items.set(key, items[key]);
    });
    Object.keys(stores).forEach(key => {
        order.stores.set(key, stores[key]);
    });
    OrdersService.saveOrder(order).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /saveOrder : ' + err); res.status(500).send({ err : err}); }
    });
});

module.exports = router;
