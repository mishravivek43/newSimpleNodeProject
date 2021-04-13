const app = require('express');
let router = app.Router();

let tasksController = require('../controllers/tasksController');
let apiService = require('../services/apiKeyVerification'); //middleware to verify apiKey

//------------------------------------ CRUD routers (api) ---------------------------

router.get('/', tasksController.getAllTasks);
router.post('/updateTask', apiService, tasksController.updateTask);

router.post('/createTask', tasksController.createTask);

module.exports = router;