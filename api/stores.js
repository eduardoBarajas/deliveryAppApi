var express = require('express');
var router = express.Router();
const StoreService = require('../services/stores_service');

router.get('/getAllStores/:onlyActive', (req, res) => {
  let onlyActive = req.params.onlyActive;
  StoreService.getAllStores(onlyActive).subscribe({
    next(stores) { 
      let response = {status: '', message: '', stores: []};
      if (stores.length > 0) {
        response = {status: 'success', message: 'Se obtuvieron las tiendas con exito.', stores: stores};
      } else {
        response = {status: 'warning', message: 'No se encontraron tiendas que mostrar.'};
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
        response = {status: 'success', message: 'Se obtuvieron las tiendas con exito.', stores: stores};
      } else {
        response = {status: 'warning', message: 'No se encontraron tiendas que mostrar.'};
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
