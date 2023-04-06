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
        required: true,
        min: 6
    },
    role: {
        type: String,
        required: false,
        default: 'user'
    },
    birth: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://picsum.com/400/800'
    },
    isActive:{
        type: Boolean,
        default: true
    }
}, { timestamps: true, strict: true });

module.exports = mongoose.model('UsersModel', UsersSchema, 'Users');