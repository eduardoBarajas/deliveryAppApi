var express = require('express');
var router = express.Router();
var https = require('https');

router.post('/send', function(req, res, next) {
    const users = req.body.users;
    const message_push = req.body.message;
    console.log(message_push);
    var message = { 
        app_id: process.env.ONE_SIGNAL_APP_ID_LOCAL,
        contents: {'en': message_push.content},
        include_player_ids: users
    };
    // ["All"]
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic Y2NlN2Q1NWUtMjZmOC00ZDNlLWFlN2MtOGVmOTFiYzQ1MDkx"
    };
    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };
    var oneSignalReq = https.request(options, function(res) {  
        res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
         });
    });
      
    oneSignalReq.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });  
    
    oneSignalReq.write(JSON.stringify(message));
    oneSignalReq.end();
    
    res.send(JSON.stringify(oneSignalReq)).end();
});

module.exports = router;