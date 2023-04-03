const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

async function main() {
    let testAccount = await nodemailer.createTestAccount();
  
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"Capsone site mail" <foo@example.com>', // sender address
      to: "carlocap08@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}



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
        avatar: user.avatar
    }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    })

    // Return new token
    res.header('Authorization', token).status(200).send({
        token: token
    })

    main().catch(console.error);
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
        avatar: user.avatar
    }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    })

    res.header('Authorization', token).status(200).send({
        token: token
    })
})


module.exports = router