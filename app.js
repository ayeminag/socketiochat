var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require("socket.io")(server);
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/mongoose");
var userSchema = new mongoose.Schema({name: String, email: String, age: Number});
var User = mongoose.model('User', userSchema);
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static('./public'))
app.get("/", function(req, res){
  res.json({appName: "chat"});
});
app.get('/chatroom', function(req, res){
  res.sendFile("/public/index.html", {root: __dirname});
});
io.on("connection", function(socket){
  socket.emit("connected", "welcome to chat room");
  socket.on('chat message', function(data){
    socket.broadcast.emit('user message', data);
  });
});

app.get("/users", function(req, res){
  User.find(function(err, users){
    if(!err){
      res.json(users);
    }else{
      return console.log(err);
    }
  });
});

app.get("/users/:name", function(req, res){
  User.findOne({name: req.params.name},'name email age', function(err, user){
    if(user){
      res.json(user);
    }else{
      res.status(404);
      res.json({error: "User not found"});
    }
  });
});
app.post("/users", function(req, res){
  var user = new User(req.body);
  user.save();
  res.json({message: "successfull created a user", data: user});
});

app.put("/users/:name", function(req, res){
  User.findOneAndUpdate({name: req.params.name}, req.body, function(error, user){
    if(!user){
      res.status(404)
      res.json({error: "Couldn't find user"});
    }else{
      user.save();
      res.json({success: "successfully updated a user"});
    }
  });
});

app.delete("/users/:name", function(req, res){
  User.findOneAndRemove({name: req.params.name}, function(error, user){
    if(!user){
      res.status(404)
      res.json({error: "user doesn't exists"});
    }else{
      res.json({success: "Successfully deleted a user"});
    }
  });
})
server.listen(3000);