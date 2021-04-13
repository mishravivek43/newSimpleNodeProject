let mongoose = require('mongoose').connection
let Schema = require('mongoose').Schema
const bcrypt = require('bcrypt')
const saltRounds = 10

let userSchema = new Schema({
    email: {
        type: String
    },

    password: {
        type: String

    },
    isActive: {
        type: Boolean,
        default: true

    },

    createdAt: {
        type: String,
        default: new Date()

    },

    createdBy: {
        type: String

    },

    updateDetails: [{
        date: {
            type: Date,
        },
        time: {
            type: String,

        },
        userId: {
            type: String,

        },

    }],

    imageUrl: {
        type: String,

    },

    deviceDetails: {
        type: Object,

    },

    deviceToken: {
        type: String,

    },

    userToken: {
        type: String,

    }
}, { strict: false })

userSchema.pre('save', function (next) {
    var user = this
    if (!user.isModified('password')) return next()
    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return next(err)
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)
            user.password = hash
            next()
        })
    })
})
userSchema.pre('update', function (next) {
    var user = this
    if (user._update['$set'].password) {
        bcrypt.genSalt(saltRounds, function (err, salt) {

            if (err) return next(err)
            bcrypt.hash(user._update['$set'].password, salt, function (err, hash) {
                if (err) return next(err)
                user._update['$set'].password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.pre('findOneAndUpdate', function (next) {
    var user = this;
    if (user._update['$set'].password) {
        console.log("..........." + user._update['$set'].password);
        bcrypt.genSalt(saltRounds, function (err, salt) {

            if (err) return next(err)
            bcrypt.hash(user._update['$set'].password, salt, function (err, hash) {
                if (err) return next(err)
                user._update['$set'].password = hash
                next()
            })
        })
    } else {
        next()
    }

})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    console.log("userSchema.methods.comparePassword -> isMatch", isMatch)
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.index({ email: 1 }, { unique: true })


const userModel = mongoose.model('users', userSchema, 'users')
module.exports = userModel
