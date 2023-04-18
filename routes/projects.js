const express = require('express');
const router = express.Router();
const Projects = require('../models/projects')
const Users = require('../models/users');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const verified = require('../middlewares/verifyToken');


router.get('/projects', async (req, res) => {
    const { author, page = 1, limit = 10 } = req.query;
    const query = {}

    if (author) {
        query.author = author;
    }

    try {
        const projects = await Projects.find(query)
            .populate('author')
            .populate('editor')
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const totalDocuments = await Projects.countDocuments(query);

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

router.get('/projects/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const project = await Projects.findById(id)
            .populate('author')
            .populate('editor')

        if(!project){
            return res.status(404).send({
                message: 'Non esiste nessun progetto con questo ID'
            })
        }

        res.status(200).send(project);
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 100)
      const fileExtension = file.originalname.split('.').pop();
      cb(null, file.originalname + '-' + uniqueSuffix + '.' + fileExtension)
    }
})
  
const upload = multer({ storage: storage })

router.post('/projects', verified, upload.single('file'), async (req, res) => {
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
        file: req.file,
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

//GET URL UPLOADED FILE
router.get('/projects/:id/:filename', async (req, res) => {
    const {id, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    try {
        const project = await Projects.findById(id)

        if(!project){
           return res.status(404).send({
                message: 'Non esiste nessun progetto con questo ID'
            })
        }

        res.status(200).sendFile(filePath);
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
    
});  


router.patch('/projects/:id', verified, upload.single('file'), async (req, res) => {
    const {id} = req.params;
    const projectExist = await Projects.findById(id);

    if(!projectExist){
        return res.status(404).send({
            message: 'Non esiste nessun progetto con questo ID'
        })
    }

    try {
        const dataToUpdate = req.body
        if (req.file) {
            dataToUpdate.file = req.file;
        }
        const option = {
            new: true
        }
        const result = await Projects.findByIdAndUpdate(id, dataToUpdate, option);
        res.status(200).send({
            message: 'Progetto aggiornato con successo',
            payload: result
        })
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
});


router.delete('/projects/:id', verified, async (req, res) => {
    const {id} = req.params;

    try {
        const project = await Projects.findById(id).deleteOne();

        if(!project){
            return res.status(404).send({
                message: 'Non esiste nessun progetto con questo ID'
            })
        }

        res.status(200).send({
            message: 'Progetto eliminato con successo'
        })
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
});

module.exports = router