var express = require('express');
var router = express.Router();
const ProductService = require('../services/products_service');
const EntityCategoryModel = require('../models/entityCategory');

router.post('/getProductsCategories', function(req, res, next) {
    EntityCategoryModel.find({entityType: 'product'}, (err, categories) => {
        if (err) {
            console.error('ERROR: /getProductsCategories/ : ' + err); 
            res.status(500).send({ err : err});
        }
        if (categories.length > 0) {
            res.send({status: 'success', message: 'Se obtuvieron las categorias con exito.', categories: categories});
        } else {
            res.send({status: 'warning', message: 'No hay categorias agregadas.', categories: []});
        }
    });
});

router.get('/getAllProducts/:onlyActive', function(req, res, next) {
    let only_active = req.params.onlyActive;
    ProductService.getAllProducts(only_active).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getAllProducts/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getAllProductsByIdStore/:store_id/:onlyActive', function(req, res, next) {
    let store_id = req.params.store_id;
    let onlyActive = req.params.onlyActive;
    ProductService.getAllProductsByIdStore(store_id, onlyActive).subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getProductsByIdStore/:product_id/:onlyActive : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getAditionalProductsByIdStore/:store_id/:onlyActive', function(req, res, next) {
    let store_id = req.params.store_id;
    let onlyActive = req.params.onlyActive;
    ProductService.getAditionalProductsByIdStore(store_id, onlyActive).subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getProductsByIdStore/:product_id/:onlyActive : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getProductsByIdProduct/:product_id/:onlyActive', function(req, res, next) {
    let product_id = req.params.product_id;
    let onlyActive = req.params.onlyActive;
    ProductService.getAditionalProductsByIdProduct(product_id, onlyActive).subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getAditionalProductsByIdProduct/:product_id/:onlyActive : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getProductsByIdStore/:store_id/:onlyActive', function(req, res, next) {
    let store_id = req.params.store_id;
    let onlyActive = req.params.onlyActive;
    ProductService.getProductsByIdStore(store_id, onlyActive).subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getProductsByIdStore/:store_id/:onlyActive : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/getProductByListOfIds', function(req, res, next) {
  let products_ids = req.body.products_ids;
  console.log(products_ids)
  ProductService.getProductByListOfIds(products_ids).subscribe({
      next(response) { res.send(response); },
      error(err) { console.error('ERROR: /getProductByListOfIds : ' + err); res.status(500).send({ err : err}); }
  });
});

router.get('/getProductById/:product_id', function(req, res, next) {
    let product_id = req.params.product_id;
    ProductService.getProductById(product_id).subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getProductById/:product_id : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/saveProduct', (req, res) => {
    ProductService.saveProduct(req.body.product).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /saveProduct: ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/activateProductById/:product_id', (req, res) => {
    let product_id = req.params.product_id;
    ProductService.activateProductById(product_id, req.body.active).subscribe({
        next(response) { res.status(200).send(response); },
        error(err) { console.error('ERROR: /activateProductById : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/deleteProductById/:product_id', (req, res) => {
    let product_id = req.params.product_id;
    ProductService.deleteProductById(product_id).subscribe({
        next(response) { res.status(200).send(response); },
        error(err) { console.error('ERROR: /deleteProductById : ' + err); res.status(500).send({ err : err}); }
    });
});

module.exports = router;
