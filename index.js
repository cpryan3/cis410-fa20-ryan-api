const express = require('express')

const db = require('./dbConnectExec.js')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const config = require('./config.js')

const app = express();
app.use(express.json())

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

// app.post()
// app.put()
// app.delete()

app.post("/reviewer/login", async (req,res)=>{
    // console.log('/reviewer/login called')
    console.log(req.body)

    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        return res.status(400).send('bad request')
    }

    //1. check that user email exsists in db
    var query = `Select *
    FROM reviewer
    where email = '${email}'`

    // var result = await db.executeQuery(query);

    let result;

    try{
        result = await db.executeQuery(query);
    }catch(myError){
        console.log('error in reviewer/login', myError);
        return res.status(500).send()
    }

    // console.log(result)

    if(!result[0]){
        return res.status(400).send('Invalid user credentials')
    }

    //2. check their password

    let user = result[0]
    // console.log(user)
    // this if statement works but i think i can't use it beacuse of the hash think
    // if(!bcrypt.compareSync(password,user.password)){
    //     console.log("invalid password")
    //     return res.status(400).send("invalid user crendentials")
    // }
    //This is just a place holder until i can use the hashed password
    if(user.password != password){
        console.log("invalid password")
        return res.status(400).send("invalid user crendentials")
    }


    //3. generate a token

    let token = jwt.sign({pk: user.ReviwerPK}, config.JWT, {expiresIn: '60 minutes'})

    // console.log(token)

    //4. save the token in db and send token and user info

    let setTokenQuery = `UPDATE Reviewer
    SET Ticket = '${token}'
    WHERE ReviewerPK = ${user.ReviewerPK}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            ticket: token,
            user: {
                FName: user.FName,
                LName: user.LName,
                Email: user.Email,
                ReviewerPK: user.ReviewerPK
            }
        })
    }
    catch(myError){
        console.log("error setting user token ", myError)
        res.status(500).send()
    }
})

app.post("/reviewer", async (req,res)=> {
    // res.send("creating user")
    // console.log("request body", req.body)

    var FName= req.body.FName;
    var LName = req.body.LName;
    var CompanyName = req.body.CompanyName
    var Email = req.body.Email;
    var password = req.body.password;

    if(!FName || !LName || !CompanyName || !Email || !password){
        return res.status(400).send("bad request")
    }

    FName = FName.replace("'","''")
    LName = LName.replace("'","''")


    var emailCheckQuery = `SELECT Email
    FROM Reviewer
    WHERE Email = '${Email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    // console.log("existing User",existingUser)

    if(existingUser[0]){
        return res.status(409).send('Please enter a different email.')
    }
    //Hashed Password is too long for what i have so that has to change
    var hashedPassword = bcrypt.hashSync(password)
    var insertQuery = `INSERT INTO Reviewer(FName, LName, Email, CompanyName, password)
    VALUES ('${FName}','${LName}','${Email}','${CompanyName}', '${password}')`
    db.executeQuery(insertQuery)
        .then(()=>{res.status(201).send()})
        .catch((err)=>{
            console.log("error in POST /reviewer", err)
            res.status(500).send()
        })

})

app.get("/VideoGame",(req,res)=>{
    //GET DATA FROM DATABASE
    db.executeQuery(`SELECT *
    FROM VideoGame
    LEFT JOIN Genre
    ON genre.GenrePK = VideoGame.GenreFK`)
    .then((result)=>{
        res.status(200).send(result)
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).send()
    })
})

app.get("/VideoGame/:pk", (req, res)=>{
    var pk = req.params.pk
    // console.log("my PK", pk)

    var myQuery = `SELECT *
    FROM VideoGame
    LEFT JOIN Genre
    ON genre.GenrePK = VideoGame.GenreFK
    WHERE VideoGamePK = ${pk}`

    db.executeQuery(myQuery)
    .then((VideoGame)=>{
        // console.log("Movies: ", movies)

        if(VideoGame[0]){
            res.send(VideoGame[0])
        }else{res.status(404).send('bad request')}
    })
        .catch((err)=>{
            console.log("Error in /VideoGame/pk", err)
            res.status(500).send()
        })
})

app.listen(5000,()=>{console.log("app is running on port 5000")})