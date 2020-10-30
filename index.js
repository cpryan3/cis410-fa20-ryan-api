const express = require('express')

const db = require('./dbConnectExec.js')

const bcrypt = require('bcryptjs')

const app = express();
app.use(express.json())

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

// app.post()
// app.put()
// app.delete()
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