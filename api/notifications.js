var express = require('express');
var router = express.Router();
var https = require('https');
const { env } = require('process');
const PUSH_NOTIFICATIONS_TYPES = require('../utils/pushNotificationsTypes');
const NotificationsService = require('../services/notifications_service');

router.post('/sendPush', function(req, res, next) {
    console.log(req.body);
    const users = req.body.users;
    const message_push = req.body.message;
    const notification_type = req.body.notificationType;
    NotificationsService.getUsersIds(notification_type).subscribe({
        next(usersIds) {
            if (notification_type == PUSH_NOTIFICATIONS_TYPES.SEND_ONLY_TO_USERS_LIST) 
                usersIds = users;
            console.log(message_push);
            var message = { 
                //app_id: process.env.ONE_SIGNAL_APP_ID_LOCAL,
                app_id: process.env.ONE_SIGNAL_APP_ID_PROD,
                contents: {'en': message_push.content},
                include_external_user_ids: usersIds
            };
            console.log(message);
            // ["All"]
            var headers = {
                "Content-Type": "application/json; charset=utf-8",
                //"Authorization": "Basic " + process.env.ONE_SIGNAL_APP_API_KEY_LOCAL
                "Authorization": "Basic " + process.env.ONE_SIGNAL_APP_API_KEY_PROD
            };
            console.log(headers);
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
        },
        error(err) { console.error('ERROR: /send : ' + err); res.status(500).send({ err : err}); }
    })
});

module.exports = router;