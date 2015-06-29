// nodemon index.js
// avalesh ke vasl mishe hame friend hashu befreste

var express = require('express');
var app = express();
var _ = require('lodash');
var http = require('http');
var server = http.createServer(app);
var path = require('path');

//var io = require('socket.io')(http);

io = require('socket.io').listen(server);

//var socket = io.listen(1223, "1.2.3.4");


server.listen(3000);
console.log("listening on 3000");

function temp_friend(){
    var full_name = undefined;
    var username = undefined;
}

function User() {
    var full_name = undefined;
    var username = undefined;
    var socket;
    var friends = new Array;
}

function Message(){
    var from;
    var to;
    var text;
    var time;
}

var messages = {};
var users = {};

io.sockets.on('connection', function(client){
    var usr = new User();
    var target_user_socket;

    app.get('/', function(req, res){
        res.render('index.jade', {

        });
    });

    console.log('a user connected');

    client.on('target message', function(target){
        for(var i = 0 ; i < _.keys(users).length ; i++) {
            if(users[_.keys(users)[i]].username == target){
                target_user_socket = users[_.keys(users)[i]].socket;
                break;
            }
        }
    });

    client.on('chat message', function(msg){
        target_user_socket.emit('chat message', msg);
    });

    client.on('add friend', function(name){
        var notFind = false;
        for(var i = 0 ; i < _.keys(users).length ; i++) {
            //console.log("keys: "+_.keys(users)[i]);
            if(users[_.keys(users)[i]].username == name) {
                //console.log(name);
                var friend = new temp_friend();
                friend.full_name = users[_.keys(users)[i]].full_name;
                friend.username = users[_.keys(users)[i]].username;
                users[client.id].friends.push(friend);
                notFind = true;
                client.emit('add friend success', friend);
                //console.log(users[client.id].friends[0].full_name);
                break;
            }
        }
        if(!notFind){
            // no user find send to client! ...
        }
    });

    client.on('join', function(userObj){

        usr.username = userObj.username;
        usr.full_name = userObj.full_name;
        usr.socket = client;
        usr.friends = [];
        var hasUser = false;
        var auth = false;
        for(var i = 0 ; i < _.keys(users).length ; i++){
            if(users[_.keys(users)[i]].username == userObj.username){
                hasUser = true;
                //console.log(users[_.keys(users)[i]].socket);
                //console.log(usr.socket);
                if(users[_.keys(users)[i]].socket == usr.socket){ // we must check that this user is authenticated user <---I don't know how!
                    auth = true;
                    client.emit('friends list', users[_.keys(users)[i]].friends);
                }
                break;
            }
        }
        if(!hasUser) { // if we have not this user
            //console.log("Client id: "+client.id);
            users[client.id] = usr;
            //console.log(users[client.id]);
        }

        client.emit('info', userObj);  //socket just for a user, io for all connected users

        //io.sockets.emit("join_notife", usr.full_name + "has joined!");


        //for(var i = 0 ; i < users.length ; i++) {
        //    console.log(users[i].username);
        //}
    });

    client.on('disconnect', function(){
        //for(var i = 0 ; i < users.length ; i++){
        //    if(users[i].socket === socket){
        //        if (i > -1) {
        //            users.splice(i, 1);
        //            break;
        //        }
        //    }
        //}
        console.log('user disconnected');
    });
});

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));



