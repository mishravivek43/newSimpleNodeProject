const app = require('express');
let router = app.Router();

let userController = require('../controllers/userController');
let apiService = require('../services/apiKeyVerification'); //middleware to verify apiKey

//------------------------------------ CRUD routers (api) ---------------------------

router.get('/', apiService, userController.getAllUser);
router.get('/:id', apiService, userController.getUserWithTask);
router.post('/updateUser', apiService, userController.updateUser);

router.post('/signIn', userController.signIn);
router.post('/createUser', userController.createUser);

router.post('/uploadImage/', apiService, userController.uploadImage);

// router.get('/getImage/', apiService, userController.getImage);

// router.get('/sendSMStoUser/', apiService, userController.sendSMStoUser);


module.exports = router;