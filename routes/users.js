const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const bcrypt = require('bcrypt');


router.get('/users', async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).send(users);    
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


router.post('/users', async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const users = new Users({
        name: req.body.name,
        surname: req.body.surname,
        nickname: req.body.nickname,
        email: req.body.email,
        password: hashPassword,
        birth: req.body.birth,
        avatar: req.body.avatar
    })
    
    try {
        const newUser = await users.save()
        res.status(200).send({
            message: 'Utente salvato con successo nel database',
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


router.delete('/users/:id', async (req, res) => {
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


router.patch('/users/:id', async (req, res) => {
    const {id} = req.params;
    const userExist = await Users.findById(id);

    if(!userExist){
        return res.status(404).send({
            message: 'Non esiste nessun autore con questo ID'
        })
    }

    try {
        const dataToUpdate = req.body
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


module.exports = router