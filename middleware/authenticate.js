const jwt = require('jsonwebtoken')
const config = require('../config.js')
const db = require('../dbConnectExec.js')

const auth = async(req, res,next)=>{
    // console.log(req.header('Authorization'))
    try{
        //1. decode the token

        let myToken = req.header('Authorization').replace('Bearer ', '')
        // console.log(myToken)

        //when this executes it doesn't come back with a PK i have no idea how to fix that
        let decodedToken = jwt.verify(myToken, config.JWT)
        console.log(decodedToken)
        let reviewerPK = decodedToken.pk;
        console.log(reviewerPK)
        //2. compare token with db token

        let query = `SELECT ReviewerPK, FName, LName, Email
        FROM Reviewer
        WHERE ReviewerPK = ${reviewerPK} and Ticket = '${myToken}'`

        let returnedUser = await db.executeQuery(query)
        console.log(returnedUser)
        // 3. save user information in request

        if (returnedUser[0]){
            req.reviewer = returnedUser[0];
            next()
        }
        else{res.status(401).send('Authentication Failed. man')}
    }catch(myError){
        res.status(401).send("Authentication Failed.")
    }
}

module.exports = auth
