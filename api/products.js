var express = require('express');
var router = express.Router();
const ProductService = require('../services/products_service');

router.get('/getAllProducts/', function(req, res, next) {
    ProductService.getAllProducts().subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getAllProducts/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getProductsByIdStore/:store_id', function(req, res, next) {
    let store_id = req.params.store_id;
    ProductService.getProductsByIdStore(store_id).subscribe({
        next(response) { console.log(response); res.send(response); },
        error(err) { console.error('ERROR: /getProductsByIdStore/:store_id : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getProductById/:product_id', function(req, res, next) {
  let product_id = req.params.product_id;
  ProductService.getProductById(product_id).subscribe({
      next(response) { res.send(response); },
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
        next(response) { 
            if (response != null) {
                res.status(200).send({status: 'success', message: 'Se actualizo con exito', store: response});
            } else {
                res.status(304).send({ status: 'warning', message: 'No se hicieron cambios que guardar.'});
            }
        },
        error(err) { console.error('ERROR: /activateProductById : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/deleteProductById/:product_id', (req, res) => {
    let product_id = req.params.product_id;
    ProductService.deleteProductById(product_id).subscribe({
        next(response) {
            if (response != null) {
                res.status(200).send({status: 'success', message: 'Se elimino con exito', store: response});
            } else {
                res.status(304).send({ status: 'warning', message: 'No se hicieron cambios que guardar.'});
            }
        },
        error(err) { console.error('ERROR: /deleteProductById : ' + err); res.status(500).send({ err : err}); }
    });
});

module.exports = router;
