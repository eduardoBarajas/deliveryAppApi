var express = require('express');
var router = express.Router();
const ReviewService = require('../services/reviews_service');

router.post('/getAllReviewsByEntityId/:entityId', function(req, res, next) {
    let entityId = req.params.entityId;
    ReviewService.getAllReviewsByEntityId(entityId).subscribe({
        next(response) { res.send(response); },
        error(err) { console.error('ERROR: /getAllReviewsByEntityId/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/deleteReviewById/:idRev', function(req, res, next) {
    let id_review = req.params.idRev;
    ReviewService.deleteReview(id_review).subscribe({
        next(response) { res.send(response)},
        error(err) { console.error('ERROR: /deleteReviewById/ : ' + err); res.status(500).send({ err : err}); }
    });
});

router.post('/saveReview', function(req, res, next) {
    console.log(req.body.review);
    let review = {...req.body.review};
    ReviewService.saveReview(req.body.review).subscribe({
        next(response) { res.send(response) },
        error(err) { console.error('ERROR: /saveReview : ' + err); res.status(500).send({ err : err}); }
    });
});


module.exports = router;
