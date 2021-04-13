let mongoose = require('mongoose').connection
let Schema = require('mongoose').Schema
let users = require('./usersModel');
let assert = require('assert');
let taskSchema = new Schema({
    user: {
         type: Schema.Types.ObjectId, ref: 'users' , required: true
    },
    name: {
        type: String, required: true
    },

    createdDate:{
        type:Date, required: true, default:new Date()
    },

    isActive:{
        type:Boolean, default:true
    },
})

const tasksModel = mongoose.model('tasks', taskSchema, 'tasks')
const task = new tasksModel();
task.save(function(error) {
  assert.equal(error.errors['name'].message,
    'Path `name` is required.');

//   error = cat.validateSync();
  assert.equal(error.errors['name'].message,
    'Path `name` is required.');
});
module.exports = tasksModel