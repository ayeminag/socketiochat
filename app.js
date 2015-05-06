var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

app.use("/public", express.static("./public"));
app.get("/", function(req, res){
  res.sendFile(__dirname+"/public/index.html");
});

io.sockets.on("connection", function(socket){
  socket.emit("connected", "you are now connected to server");
  socket.on("chat message", function(data){
    socket.broadcast.emit("user message", data);
  });
});

http.listen(4000, function(){
  console.log("listening on 4000");
});