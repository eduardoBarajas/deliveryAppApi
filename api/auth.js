var express = require('express');
var router = express.Router();

router.get('/Login', function(req, res, next) {
    res.send({sessionId: req.session.id});
});

module.exports = router;
