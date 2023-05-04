const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const bcrypt = require('bcrypt');
const multer  = require('multer')
const path = require('path');
const verified = require('../middlewares/verifyToken');


router.get('/users', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const users = await Users.find()
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalDocuments = await Users.countDocuments();

        res.status(200).send({
            users,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limit),
            currentPage: page
        });    
    } 
    catch (error) {
        res.status(404).send({
            message: 'Errore interno del server', 
            error: error
        })
    }
})

router.get('/users/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const users = await Users.findById(id);
        if(!users){
            return res.status(404).send({
                message: 'Non esiste nessun utente con questo ID'
            })
        }
        
        res.status(200).send(users);
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
});


router.post('/users', verified, async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt); 

    const users = new Users({
        name: req.body.name,
        surname: req.body.surname,
        nickname: req.body.nickname,
        email: req.body.email,
        password: hashPassword,
        birth: req.body.birth,
        role: req.body.role,
        avatar: req.body.avatar,
        isActive: req.body.isActive
    })

    const uniqueEmail = await Users.findOne({
        email: req.body.email
    })

    const uniqueNick = await Users.findOne({
        nickname: req.body.nickname
    })

    if(uniqueEmail){
        return res.status(400).send({
            message: 'Errore, email già utilizzata',
            error: 'mail'
        })
    }

    if(uniqueNick){
        return res.status(400).send({
            message: 'Errore, Nickname già utilizzato',
            error: 'nick'
        })
    }
    
    try {
        const newUser = await users.save()
        res.status(200).send({
            message: 'Utente salvato con successo nel database',
            status: 'ok',
            payload: newUser
        })
    } 
    catch (error) {
        res.status(500).send({ 
            message: 'Errore interno del server',
            error: error
        })
    }
})


router.delete('/users/:id', verified, async (req, res) => {
    const {id} = req.params;

    try {
        const users = await Users.findById(id).deleteOne();

        if(!users){
            return res.status(404).send({
                message: 'Non esiste nessun utente con questo ID'
            })
        }

        res.status(200).send({
            message: 'Utente eliminato con successo dal database'
        })
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
});


router.patch('/users/:id', verified, async (req, res) => {
    const {id} = req.params;
    const userExist = await Users.findById(id); 
    const salt = await bcrypt.genSalt(10);

    if(!userExist){
        return res.status(404).send({
            message: 'Non esiste nessun autore con questo ID'
        })
    }

    try {
        const dataToUpdate = req.body
        if(dataToUpdate.password){
            const hashPassword = await bcrypt.hash(dataToUpdate.password, salt);
            dataToUpdate.password = hashPassword
        }
        
        const option = {
            new: true
        }
        const result = await Users.findByIdAndUpdate(id, dataToUpdate, option);
        res.status(200).send({
            message: 'Utente aggiornato con successo',
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

//CONFIG STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 100)
      const fileExtension = file.originalname.split('.').pop(); // ottieni l'estensione del file
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension)
    }
})
  
const upload = multer({ storage: storage })

//UPLOAD IMAGE AVATAR AND UPDATE AUTHOR'S AVATAR
router.patch('/users/:id/avatar', verified, upload.single('avatar'), async (req, res) => {
    const {id} = req.params;
    const userExist = await Users.findById(id);

    if(!userExist){
        return res.status(404).send({
            message: 'Non esiste nessun utente con questo ID'
        })
    }

    try {
        const result = await Users.findByIdAndUpdate(id, {
            $set: {
                avatar: `${process.env.DEPLOY_URL}/avatar/` + req.file.filename
            }
        }, { new: true });
        
        res.status(200).send({
            message: 'Utente aggiornato con successo',
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

//GET URL UPLOADED FILE
router.get('/avatar/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    try {
        res.status(200).sendFile(filePath);
    } 
    catch (error) {
        res.status(500).send({
            message: 'Errore interno del server',
            error: error
        })
    }
    
});


module.exports = router