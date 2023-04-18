const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization')
    if(!token){
        return res.status(401).send({
            type: 'Token non presente',
            statusCode: 401,
            errorMessage: 'Per poter utilizzare questa API hai bisogno del token di accesso, effettua il login prima di riprovare.'
        })
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)    
        req.user = verified
        next()
    } 
    catch (error) {
        return res.status(403).send({
            type: 'Token non valido',
            statusCode: 403,
            errorMessage: 'Il token della tua sessione non è valido'
        })
    }
}