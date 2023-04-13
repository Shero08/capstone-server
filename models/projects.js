 const mongoose = require('mongoose');
 mongoose.set('strictPopulate', false)

 const ProjectsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UsersModel"
    },
    file: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    editor: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UsersModel"
    }
 }, { timestamps: true, strict: true });

 module.exports = mongoose.model('ProjectsModel', ProjectsSchema, 'Projects');