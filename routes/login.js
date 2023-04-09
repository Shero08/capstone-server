const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'app.debugmail.io',
  port: 9025,
  auth: {
    user: '87561551-5cc4-4f63-a572-6c06b4b02778',
    pass: '781f2bd1-58b8-4a59-a13d-80bc99d29e6e'
  }
});


router.get('/send-email', async (req, res) => {
    const mailOptions = {
      from: 'your-email@example.com',
      to: 'carlocap08@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from Nodemailer in Express.',
    };
  
    transporter.sendMail(mailOptions)
    .then(info => {
      res.send('Email sent');
    })
    .catch(error => {
      res.status(500).send('Error sending email');
    });
  });

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if(!token){
        return res.status(401).send('Accesso non autorizzato o token mancante');
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();    
    } 
    catch (error) {
        return res.status(400).send('Token non valido o scaduto');
    }
}

router.post('/login', async (req, res) => {
    const user = await Users.findOne({
        email: req.body.email
    })

    if(!user){
        return res.status(400).send('Email non trovata')
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if(!validPassword){
        return res.status(400).send('Password errata')
    }

    // Generate JWT token
    const token = jwt.sign({ 
        name: user.name, 
        surname: user.surname,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        birth: user.birth,
        avatar: user.avatar,
        isActive: user.isActive,
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    })

    // Return new token
    res.header('Authorization', token).status(200).send({
        token: token
    })
})

router.post('/refresh-token', verifyToken, async (req, res) => {
    const user = await Users.findOne({ name: req.user.name })

    if(!user){
        return res.status(400).send('Utente non trovato');
    }

    const token = jwt.sign({ 
        name: user.name, 
        surname: user.surname,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        birth: user.birth,
        avatar: user.avatar,
        isActive: user.isActive,
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    })

    res.header('Authorization', token).status(200).send({
        token: token
    })
})


module.exports = router