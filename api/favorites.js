var express = require('express');
var router = express.Router();
const FavoritesService = require('../services/favorites_service');

router.get('/getAllFavoritesByIdUserAndType/:idUser/:type', function(req, res, next) {
    let id_user = req.params.idUser;
    let type_favorite = req.params.type;
    FavoritesService.getAllFavoritesByIdUserAndType(id_user, type_favorite).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getAllFavoritesByIdUserAndType/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.get('/getFavoriteByIdUserAndIdElement/:idUser/:idElement', function(req, res, next) {
    let id_user = req.params.idUser;
    let id_element = req.params.idElement;
    FavoritesService.getFavoriteByIdUserAndIdElement(id_user, id_element).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getFavoriteByIdUserAndIdElement: ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/deleteFavoriteById/:idFav', function(req, res, next) {
    let id_favorite = req.params.idFav;
    FavoritesService.deleteFavorite(id_favorite).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /deleteFavoriteById/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/saveFavorite', function(req, res, next) {
    FavoritesService.saveFavorite(req.body.favorite).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /saveFavorite : ' + err); res.status(500).send({ err : err}); }
    });
});


module.exports = router;
