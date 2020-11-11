var express = require('express');
var router = express.Router();
const StoreService = require('../services/stores_service');

router.get('/getStoresByIdStore', function(req, res, next) {
  StoreService.getStoresByIdStore().subscribe({
    next(response) { res.send(response); },
    error(err) { console.error('ERROR: /getStoresByIdStore : ' + err); res.status(500).send({ err : err}); }
  });
});

router.get('/getStoreById/:store_id', function(req, res, next) {
  let store_id = req.params.store_id;
  StoreService.getStoreById(store_id).subscribe({
    next(response) { res.send(response); },
    error(err) { console.error('ERROR: /getStoreById/:store_id : ' + err); res.status(500).send({ err : err}); }
  });
});

router.post('/activateStoreById/:store_id', (req, res) => {
  let store_id = req.params.store_id;
  StoreService.activateStoreById(store_id, req.body.active).subscribe({
    next(response) { 
      if (response != null) {
        res.status(200).send({status: 'success', message: 'Se actualizo con exito', store: response});
      } else {
        res.status(304).send({ status: 'warning', message: 'No se hicieron cambios que guardar.'});
      }
    },
    error(err) { console.error('ERROR: /activateStoreById : ' + err); res.status(500).send({ err : err}); }
  });
});

router.post('/deleteStoreById/:store_id', (req, res) => {
  let store_id = req.params.store_id;
  StoreService.deleteStoreById(store_id).subscribe({
    next(response) {
      if (response != null) {
        res.status(200).send({status: 'success', message: 'Se elimino con exito', store: response});
      } else {
        res.status(304).send({ status: 'warning', message: 'No se hicieron cambios que guardar.'});
      }
    },
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
