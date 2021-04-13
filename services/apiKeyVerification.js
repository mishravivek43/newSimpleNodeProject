let db = require('./databaseQueries');
let user = require('../models/usersModel');

//verifyApiKey for checking whether apiKey is valid
async function verifyApiKey(req, res, next) {

    let apiKey = req.header('apiKey');
    if (apiKey == undefined) {
        return res.status(200).send({
            statusCode: 401,
            statusMsg: "Failed",
            msg: 'Unauthorized access!' });
    }


    let loginAppKey = await db.findOne(user, {'apiKey': apiKey});

    if (loginAppKey == null) {
        return res.status(200).send({
            statusCode: 401,
            statusMsg: "Failed",
            msg: 'Unauthorized access!' });

    } else {
        next();

    }

}

module.exports = verifyApiKey;