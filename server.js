const express = require("express");
const bodyParser = require("body-parser");
const mongojs = require("mongojs");
const cors = require('cors');

const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const dbname = "xyz";
const collection = ['abc'];
var ObjectId = require('mongodb').ObjectID;

// PORT
const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

var db = mongojs(dbname, collection);


app.get("/", (req, res) => {
  
  //res.json({ message: "API Working" });
  res.sendFile(__dirname + '/register.html');
});

app.get("/login", (req, res) => {
  
    //res.json({ message: "API Working" });
    res.sendFile(__dirname + '/login.html');
});

app.post('/signup',async (req,res)=>{

    //validation
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { username,email,password } = req.body;
   
    try{

        await db.auth.findOne({ email },async(err,msg)=>{
           
            if(err){
                console.log(err);
                
            }else{
                //console.log(msg);
                var user = msg;
               
            }

            var usr = user;
            //return usr;
       
            if (usr) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            } else{

                const salt = await bcrypt.genSalt(10);
                password = await bcrypt.hash(password, salt);

                    db.auth.save({
                        username: username,
                        email: email,
                        password: password 
                    },(err,msg)=>{
                        if(err){
                            console.log(err);
                            
                        }else{
                            //console.log(msg);
                            //res.send(msg);


                            var payload = {
                                user: {
                                    id: msg._id
                                }
                            };

                        
                            jwt.sign(
                                payload,
                                "randomString", {
                                    expiresIn: 10000
                                },
                                (err, token) => {
                                    if (err) throw err;
                                    res.status(200).json({
                                        token
                                    });
                                }
                            );
        
        
                            
                        }
                    });


            }
           
        });     

    }catch{

        //console.log(err);
        res.status(500).send("Error in Saving");

    }

});

app.post('/login',async(req,res)=>{

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    let { email, password } = req.body;

    try{

        await db.auth.findOne({ email },async(err,msg)=>{
           
            if(err){
                console.log(err);
                
            }else{
                //console.log(msg);
                var user = msg;
               
            }

            var usr = user;

            if (!usr)
                return res.status(400).json({
                message: "User Not Exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !"
                });
            
            const payload = {
                user: {
                    id: usr._id
                }
            };

            
            jwt.sign(
                payload,
                "secret",
                {
                  expiresIn: 3600
                },
                (err, token) => {
                  if (err) throw err;
                  res.status(200).json({
                    token
                  });
                }
            );
            

        });

    }catch(e){

        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });

    }

});


app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});
