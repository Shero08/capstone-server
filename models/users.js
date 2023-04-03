const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    birth: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    }
}, { timestamps: true, strict: true });

module.exports = mongoose.model('UsersModel', UsersSchema, 'Users');