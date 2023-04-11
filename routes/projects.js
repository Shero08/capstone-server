const express = require('express');
const router = express.Router();
const Projects = require('../models/projects')
const Users = require('../models/users');
const multer = require('multer');


router.get('/projects', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const projects = await Projects.find()
            .populate('Users')
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const totalDocuments = await Projects.countDocuments();

        res.status(200).send({
            projects,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limit),
            currentPage: page
        });
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
});

router.post('/projects', async (req, res) => {
    const { author } = req.body
    const findAuthor = await Users.findById(author)

    if(!author){
        return res.status(400).send("Utente non trovato")
    }

    const project = new Projects({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        author: findAuthor._id,
        file: req.body.file,
        status: req.body.status
    })
    
    try {
        const newProject = await project.save()
        res.status(200).send({
            message: 'Nuovo progetto creato con successo',
            payload: newProject
        })
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
})

module.exports = router