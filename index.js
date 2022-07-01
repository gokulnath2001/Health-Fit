//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { truncate } = require("lodash");

const app = express();

const http = require('http').Server(app)
const io = require('socket.io')(http)


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("images"));

mongoose.connect('mongodb://localhost:27017/fitDB',
{
  useNewurlParser: true
});

const userSchema = {
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        
    },
  };
const User = mongoose.model("User", userSchema);

const adminSchema = {
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        
    },
  };
const Admin = mongoose.model("Admin", adminSchema);



const metricSchema = {
    username: {
        type: String,
        required: true
    },
    height: {
        type: Number,
        
    },
    age: {
        type: Number,
        required: truncate,
    },
    weight: {
        type: Number,
        
    },
    calories: {
        type: Number,
        
    },
    steps: {
        type: Number,
        
    },
    bmi: {
        type: Number
    },
    sex: String,
};
const Metric = mongoose.model("Metric", metricSchema);


const count =0 ;
app.get("/",function(req,res){
    res.render("home");
});

app.get("/register",function(req,res){
    res.render("register",{count:count});
});

app.get("/login",function(req,res){
    res.render("login",{count:count});
});

app.get("/adminlogin",function(req,res){
    res.render("admin-login",{count:count});
});

app.get("/webapp/:user", function(req, res){
    const username = req.params.user;
    res.render("webapp",{username: username});
});

app.get("/aboutus", function(req,res){
    res.render("aboutus");
});

app.get("/dashboard/:user",function(req,res){
    const username = req.params.user;
    Metric.findOne({username: username}, function(err, founduser){
        if(err){
            res.render("home");
        }
        else{
            if(founduser){
                var fit;
                var caloriesBurned= 1200 + (founduser.steps * 0.06 );
                // * founduser.bmi * founduser.age * 3
                if(founduser.steps < 5000){
                     fit = "BAD😫";
                }
                else if(founduser.steps < 9000){
                     fit = "GOOD😊";
                }
                else{
                     fit = "EXCELLENT🤐🤑😤🤯";
                }
                res.render("dashboard",{
                    username: username,
                    founduser: founduser,
                    caloriesBurned: caloriesBurned,
                    fit: fit
                });
            }
        }
    });
    
});

app.get("/client", function(req,res){
    res.render("index");
});

app.get("/admin/vid", function(req,res){
    res.render("index");
});

app.get("/upload/:user",function(req,res){
    const userName = req.params.user;
    res.render("upload",{username: userName});
});

app.get("/update/:user",function(req,res){
    const userName = req.params.user;
    res.render("update",{username: userName});
});

app.get("/steps/:user",function(req,res){
    const userName = req.params.user;
    res.render("steps",{username: userName});
});

app.post("/register",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    var count =0;
    User.findOne({username: username}, function(err, founduser){
        if(err){
            res.render("login");
        }
        else{
            if(founduser){
                count = 1;
                res.render("register",{count:count});
            }
            else{
                const userItem = new User({
                    username: req.body.username,
                    password: req.body.password
                });
                userItem.save();
                res.redirect("/upload/" + req.body.username);
            }
        }
    });
    // const userItem = new User({
    //     username: req.body.username,
    //     password: req.body.password
    // });
    // userItem.save();
    // res.redirect("/upload/" + req.body.username);
});

app.post("/login",function(req,res){
    var count =0;
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username: username}, function(err, founduser){
        if(err){
            res.render("login");
        }
        else{
            if(founduser){
                if(founduser.password === password ){
                    res.redirect("/dashboard/" + founduser.username);
                }
                else{
                    count =1;
                    res.render("login",{count:count});
                }
            }
            else{
                count =1;
                res.render("login",{count:count});
            }
        }
    });
});

app.post("/adminlogin",function(req,res){
    var count =0;
    const username = req.body.username;
    const password = req.body.password;
    // const userItem = new Admin({
    //     username: "Sachin",
    //     password: "123"
    // });
    // userItem.save();
    Admin.findOne({username: username}, function(err, founduser){
        if(err){
            res.render("login");
        }
        else{
            if(founduser){
                if(founduser.password === password ){
                    res.render("webappadmin");
                }
                else{
                    count =1;
                    res.render("login",{count:count});
                }
            }
            else{
                count =1;
                res.render("login",{count:count});
            }
        }
    });
});

app.post("/upload",function(req,res){
    const username = req.body.user;
    var bmiItem= (req.body.weight)/(req.body.height * req.body.height);
    const metricItem = new Metric({
        username: username,
        height: req.body.height,
        weight: req.body.weight,
        age: req.body.age,
        bmi: bmiItem,
        steps:0,
        calories:0,
        sex: req.body.sex
    });
    metricItem.save();
    res.redirect("/steps/" + username);

});

app.post("/steps",function(req,res){
    const username = req.body.user;
    const steps = req.body.step*90;
    const calories = Number(calcalc(req.body.Breakfast) + calcalc(req.body.Lunch) + calcalc(req.body.Dinner));
    
    Metric.findOneAndUpdate({ username:username}, {steps: steps, calories: calories},function(err,docs){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/dashboard/" + username);
        }
    });
});

app.post("/update",function(req,res){
    const username = req.body.user;
    Metric.findOneAndUpdate({ username:username}, {
        height: req.body.height, 
        weight: req.body.weight,
        age: req.body.age,
        sex: req.body.sex,
        bmi: (req.body.weight)/(req.body.height * req.body.height)
    },function(err,docs){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/dashboard/" + username);
        }
    });
});
let clients = 0
io.on('connection', function (socket) {
    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')
        clients++;
    })
    socket.on('Offer', SendOffer)
    socket.on('Answer', SendAnswer)
    socket.on('disconnect', Disconnect)
})

function Disconnect() {
    if (clients > 0)
        clients--
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}

function calcalc(data){
    var cal = 0;
    if(data==='rice'){
        cal = 600;
    }
    if(data==='roti'){
        cal = 550;
    }
    if(data==='idli'){
        cal = 450;
    }
    return cal;
}

http.listen(3000, function() {
    console.log("Server started on port 3000.");
  });

