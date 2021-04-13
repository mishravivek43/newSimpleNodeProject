let queryController = require('../services/databaseQueries');
let users = require('../models/usersModel')
let tasks = require('../models/tasksModel');
// let debug = require('debug')('spyne:server')
let moment = require('moment-timezone')
let mongoose = require('mongoose')


let jwt = require('jsonwebtoken');

let userController = {}
//--------------------------------- Function to signIn -----------------


userController.signIn = async (req, res) => {
    // console.log(req)
    try {

        let reqBody = JSON.parse(JSON.stringify(req.body));

        let query = {
            email: reqBody.email,
            isActive: true
        }

        await queryController.findOne(users, query)
            .then(user => {
                console.log(user)
                if (!user) {
                    res.status(200).type('application/json').send({
                        "statusCode": 401,
                        "statusMsg": "Wrong user credentials!!!"
                    });
                } else {
                    // return
                    //function to compare password
                    user.comparePassword(reqBody.password, async (err, isMatch) => {
                        console.log("userController.signIn -> isMatch", isMatch)
                        if (err) {
                            res.status(200).type('application/json').send({
                                "statusCode": 401,
                                "statusMsg": err
                            });
                        }

                        // if password matches update apiKey in document
                        if (isMatch) {
                            // console.log("hgfhgfhgfhfh")
                            let query1;
                            let key;
                            // let key = apiKey();
                            try {


                                key = jwt.sign({ email: reqBody.email }, 'Ghanta');
                                query1 = {
                                    apiKey: key,
                                    // password:reqBody.password

                                };
                                console.log("userController.signIn -> query1", query1)
                            } catch (error) {
                                console.log('main error hoon');
                                console.log(error);
                            }

                            //update apiKey in user document
                            await queryController.update(users, { '_id': user._id }, query1)
                                .then(docs => {
                                    if (docs.length == 0) {
                                        error = "No data found!!"
                                        return res.status(200).type('application/json').send({
                                            "statusCode": 404,
                                            "statusMsg": error
                                        });
                                    }

                                    return res.status(200).type('application/json').send({
                                        statusCode: 200,
                                        statusMsg: "Success",
                                        dataObj: docs,
                                        // role: user.role,
                                        // locArray: user.locArray,
                                        apiKey: key  //send apiKey and data to server
                                    });
                                })
                                .catch(error => {
                                    console.log("Error: ", error);
                                    return res.status(200).type('application/json').send({
                                        "statusCode": 425,
                                        "statusMsg": error.message
                                    });
                                });

                            //Update deviceToken and deviceDetails in collection
                            if (reqBody.deviceToken || reqBody.deviceDetails) {

                                let updateObj = {
                                    deviceToken: reqBody.deviceToken,
                                    deviceDetails: reqBody.deviceDetails
                                }

                                queryController.updateOne(users, { '_id': user._id }, updateObj)
                                    .then(docs => {
                                        if (docs.length == 0) {
                                            error = "No data found!!"
                                            return res.status(200).type('application/json').send({
                                                "statusCode": 404,
                                                "statusMsg": error
                                            });
                                        }

                                    })
                                    .catch(error => {
                                        console.log("Error: ", error);
                                        return res.status(200).type('application/json').send({
                                            "statusCode": 425,
                                            "statusMsg": error.message
                                        });
                                    });

                            }

                        } else {
                            console.log("iF False")
                            res.status(200).type('application/json').send({
                                "statusCode": 401,
                                "statusMsg": "Wrong User Credentials"
                            });
                        }
                    })
                }


            })
    }
    catch (error) {
        console.log("Error: ", error);
        return res.status(200).type('application/json').send({
            "statusCode": 425,
            "statusMsg": error.message
        });
    }
}


//------------------------------- Function to get all users --------------------

userController.getAllUser = async function (req, res) {

    try {


        let query = {
            isActive: true
        }
        let limit = 5;
        let skip = 0
        if (req.query.id) {
            query['_id'] = req.query.id
        }
        if (req.query.email) {
            query['email'] = req.query.email
        }
        if(req.query.pagesize){
            limit = parseInt(req.query.pagesize)
        }
        if(req.query.page){
            skip = (req.query.page-1)*limit
        }


        // if (reqBody.username) {
        //     query['username'] = reqBody.username
        // }

        //Find users
        await queryController.findByQuery(users, query, limit, skip)
            .then(docs => {
                if (docs.length == 0) {
                    error = "No data found!!"
                    return res.status(200).type('application/json').send({
                        "statusCode": 404,
                        "statusMsg": "No records found!!!"
                    });

                }

                return res.status(200).type('application/json').send({
                    statusCode: 200,
                    statusMsg: "Success",
                    page:req.query.page || 1,
                    dataArr: docs
                });

            })
            .catch(error => {
                console.log("Error: ", error);
                return res.status(200).type('application/json').send({
                    "statusCode": 425,
                    "statusMsg": error.message
                });
            });
    } catch (error) {
        console.log("Catch Error: ", error);
        return res.status(200).type('application/json').send({
            statusCode: 400,
            statusMsg: "Failed",
            msg: 'some error occured'

        });

    }

}
userController.getUserWithTask = async function (req, res) {

    try {

        if (!req.params.id) {
            return res.status(200).type('application/json').send({
            statusCode: 400,
            statusMsg: "Failed",
            msg: 'Please send the userid'
            })

        }
        let query = {
            isActive: true
        }
        let limit = 5;
        let skip = 0
        let userId = req.params.id
        query['_id'] = userId
        let user = await queryController.findByQuery(users, query, limit, skip)
        let allTasks = await queryController.findByQuery(tasks, {user:userId}, limit, skip)
        return res.status(200).type('application/json').send({
                    statusCode: 200,
                    statusMsg: "Success",
                    // page:req.query.page || 1,
                    dataArr: user,
                    tasks:allTasks
                });


    } catch (error) {
        console.log("Catch Error: ", error);
        return res.status(200).type('application/json').send({
            statusCode: 400,
            statusMsg: "Failed",
            msg: 'some error occured'

        });

    }

}


//------------------------------- Function to create user --------------------

userController.createUser = function (req, res) {
    let reqBody = JSON.parse(JSON.stringify(req.body));
    console.log(req.body);
    try {
        //create user query
        queryController.createOne(users, reqBody)
            .then(docs => {

                return res.status(200).type('application/json').send({
                    statusCode: 200,
                    statusMsg: "Success",
                });

            })
            .catch(error => {
                console.log("Error: ", error);
                return res.status(200).type('application/json').send({
                    statusCode: 400,
                    statusMsg: "Failed",
                    msg: 'email already registered'

                });

            });
    } catch (error) {
        console.log("Catch Error: ", error);
        return res.status(200).type('application/json').send({
            statusCode: 400,
            statusMsg: "Failed",
            msg: 'some error occured'

        });

    }

}


//-------------------------------  Function to update user -----------------------
userController.updateUser = async (req, res) => {
    try {
        let today = moment();
        let time = moment().format('hh:mm:ss');

        let reqBody = JSON.parse(JSON.stringify(req.body));
        console.log("userController.updateUser -> reqBody", reqBody)
        let docId = reqBody.query._id;

        let docToBeUpdated = await queryController.findOne(users, {
            _id: mongoose.Types.ObjectId(reqBody.query._id)
        });

        docToBeUpdated = JSON.parse(JSON.stringify(docToBeUpdated))
        docToBeUpdated.updateDetails = docToBeUpdated.updateDetails ?
            docToBeUpdated.updateDetails : []
        docToBeUpdated.updateDetails.push({
            date: today,
            time: time
        });

        let updateObj = Object.assign(docToBeUpdated, reqBody);  //merge objects and update

        queryController.updateOne(users, { '_id': user._id }, updateObj)
            .then(docs => {
                if (docs.length == 0) {
                    error = "No data found!!"

                    return res.status(200).type('application/json').send({
                        "statusCode": 404,
                        "statusMsg": error
                    });
                }

            })
            .catch(error => {
                console.log("Error: ", error);

                return res.status(200).type('application/json').send({
                    "statusCode": 425,
                    "statusMsg": error.message
                });
            });
    } catch (error) {
        console.log("Error: ", error);

        return res.status(200).type('application/json').send({
            "statusCode": 425,
            "statusMsg": error.message
        });
    }

}
//-------------------------------- Function to upload image ---------------------

userController.uploadImage = async (req, res) => {

    //upload single image file to s3
    await singleUpload(req, res, async function (err, some) {
        if (err) {
            console.log(err.message);

            return res.status(200).send({
                'statusCode': 468,
                'statusMsg': 'Please upload image with (png, PNG, JPG, JPEG, jpg, jpeg) extension only'
            });
        }

        let id = req.query.username;
        if (id == null || id == '') {
            error = "Username must not be empty!"
            return res.status(200).type('application/json').send({
                "statusCode": 471,
                "statusMsg": error
            });
        }

        let uname = await users.findOne({ 'username': id }); //get user by username

        if (uname == null) {
            error = "Invalid username! Please enter valid username."
            return res.status(200).type('application/json').send({
                "statusCode": 451,
                "statusMsg": error
            });

        } else {
            error = "Username must not be empty!"

            return res.status(200).type('application/json').send({
                "statusCode": 200,
                "statusMsg": "success",
                "dataObj": {
                    "profilePic": req.file.location
                }
            });
        }
    });

}
module.exports = userController;