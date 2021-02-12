var express = require('express');
var router = express.Router();
const StoreService = require('../services/stores_service');
const EntityCategoryModel = require('../models/entityCategory');

router.post('/getStoreCategories', function(req, res, next) {
    EntityCategoryModel.find({entityType: 'store'}, (err, categories) => {
        if (err) {
            console.error('ERROR: /getStoreCategories/ : ' + err); 
            res.status(500).send({ err : err});
        }
        console.log(categories);
        if (categories.length > 0) {
            res.send({status: 'success', message: 'Se obtuvieron las categorias con exito.', categories: categories});
        } else {
            res.send({status: 'warning', message: 'No hay categorias agregadas.', categories: []});
        }
    });
});

router.get('/getAllStores/:onlyActive', (req, res) => {
  let onlyActive = req.params.onlyActive;
  StoreService.getAllStores(onlyActive).subscribe({
    next(stores) { 
      let response = {status: '', message: '', stores: []};
      if (stores.length > 0) {
        response = {status: 'success', message: 'Se obtuvieron los locales con exito.', stores: stores};
      } else {
        response = {status: 'warning', message: 'No se encontraron locales que mostrar.'};
      }
      res.status(200).send(response);
    },
    error(err) { console.error('ERROR: /getAllActiveStores : ' + err); res.status(500).send({ err : err}); }
  });
});

router.get('/getStoresByIdStoreOwner/:storeOwnerId', function(req, res, next) {
  let storeOwnerId = req.params.storeOwnerId;
  StoreService.getStoresByIdStoreOwner(storeOwnerId).subscribe({
    next(stores) {
      let response = {status: '', message: '', stores: []};
      if (stores.length > 0) {
        response = {status: 'success', message: 'Se obtuvieron los locales con exito.', stores: stores};
      } else {
        response = {status: 'warning', message: 'No se encontraron locales que mostrar.'};
      }
      res.status(200).send(response);
    },
    error(err) { console.error('ERROR: /getStoresByIdStore : ' + err); res.status(500).send({ err : err}); }
  });
});

router.get('/getStoreById/:store_id', function(req, res, next) {
  let store_id = req.params.store_id;
  StoreService.getStoreById(store_id).subscribe({
    next(response) {  res.status(200).send(response); },
    error(err) { console.error('ERROR: /getStoreById/:store_id : ' + err); res.status(500).send({ err : err}); }
  });
});

router.post('/activateStoreById/:store_id', (req, res) => {
  let store_id = req.params.store_id;
  StoreService.activateStoreById(store_id, req.body.active).subscribe({
    next(response) { 
      res.status(200).send(response);
    },
    error(err) { console.error('ERROR: /activateStoreById : ' + err); res.status(500).send({ err : err}); }
  });
});

router.post('/deleteStoreById/:store_id', (req, res) => {
  let store_id = req.params.store_id;
  StoreService.deleteStoreById(store_id).subscribe({
    next(response) { res.status(200).send(response); },
    error(err) { console.error('ERROR: /deleteStoreById : ' + err); res.status(500).send({ err : err}); }
  });
});

router.post('/saveStore', (req, res) => {
  StoreService.saveStore(req.body.store).subscribe({
    next(response) { res.send(response); },
    error(err) { console.error('ERROR: /saveStore : ' + err); res.status(500).send({ err : err}); }
  });
});

module.exports = router;
