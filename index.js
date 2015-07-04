// nodemon index.js
//mongod --smallfiles: runinng server
//mongo :running client
// avalesh ke vasl mishe hame friend hashu befreste

var express = require('express');
var app = express();
var _ = require('lodash');
var http = require('http');
var server = http.createServer(app);
var path = require('path');

var io = require('socket.io')(http);

io = require('socket.io').listen(server);


var mongodb = require('mongodb');
var mongo_client = mongodb.MongoClient;
mongo_client.connect("mongodb://127.0.0.1:27017/chat", function(err, db){
    console.log(err);
});

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
    var from_username;
    var from_full_name;
    var to_username;
    var to_full_name;
    var text;
    var time;
}

var messages = new Array;
var users = {};

app.get('/', function(req, res){
    res.render('index.jade', {
    });
});

io.sockets.on('connection', function(client){
    var usr = new User();
    var target_user;
    var target_user_id;
    var my_id;

    console.log('a user connected');

    client.on('target message', function(target){
        for(var i = 0 ; i < _.keys(users).length ; i++) {
            if(users[_.keys(users)[i]].username == target){
                target_user = users[_.keys(users)[i]];

                for(var i = 0 ; i < messages.length ; i++){
                    if((messages[i].from_username == users[my_id].username && messages[i].to_username == target_user.username)
                        || (messages[i].from_username == target_user.username && messages[i].to_username == users[my_id].username)){
                        client.emit('chat message', messages[i]);
                    }
                }
                console.log(target_user.username);
                target_user_id = _.keys(users)[i];
                break;
            }
        }
    });

    client.on('chat message', function(message){
        var mymsg = {};//new Message();
        mymsg.from_username = users[my_id].username;//users[client.id];
        mymsg.from_full_name = users[my_id].full_name;//users[client.id];
        mymsg.to_username = target_user.username;
        mymsg.to_full_name = target_user.full_name;
        mymsg.text = message;
        mymsg.time = new Date();
        messages.push(mymsg);
        //for (var i = 0 ; i < users[client.id].friends.length ; i++){
        //    if(target_user.username == users[client.id].friends[i].username){
        //        target_user.socket.emit('add friend success', users[client.id].friends[i]);
        //        break;
        //    }
        //}
        //var me = new temp_friend();
        //me.full_name = users[client.id].full_name;
        //me.username = users[client.id].username;
        //for(var i = 0 ; i < _.keys(users).length ; i++) {
        //    if(users[_.keys(users)[i]].username == target_user.username) {
        //        users[_.keys(users)[i]].friends.push(me);
        //        console.log("add to target friends successful");
        //    }
        //}
        //target_user.socket.emit('add friend success', me);
        client.emit('chat message', mymsg);
        target_user.socket.emit('chat message', mymsg);
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

                var me = new temp_friend();
                me.full_name = users[client.id].full_name;
                me.username = users[client.id].username;
                for(var i = 0 ; i < _.keys(users).length ; i++) {
                    if(users[_.keys(users)[i]].username == friend.username) {
                        users[_.keys(users)[i]].friends.push(me);
                        console.log("add to target friends successful");
                        users[_.keys(users)[i]].socket.emit('add friend success', me);
                        break;
                    }
                }
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
        for(var i = 0 ; i < _.keys(users).length ; i++){
            if(users[_.keys(users)[i]].username == userObj.username){
                hasUser = true;
                users[_.keys(users)[i]].socket = client;
                client.emit('friends list', users[_.keys(users)[i]].friends);
                my_id = _.keys(users)[i];
                break;
            }
        }
        if(!hasUser) { // if we have not this user
            //console.log("Client id: "+client.id);
            users[client.id] = usr;
            my_id = client.id;
            //console.log(users[client.id]);
        }

        client.emit('info', userObj);  //socket just for a user, io for all connected users

        //online handler
        for(var i = 0 ; i < users[my_id].friends.length ; i++){
            for(var j = 0 ; j < _.keys(users).length ; j++){
                if(users[my_id].friends[i].username == users[_.keys(users)[j]].username){
                    // username which went offline , friends which are friends of target for iterate over them
                    users[_.keys(users)[j]].socket.emit('goes online', {username: users[my_id].username, 'friends': users[_.keys(users)[j]].friends});
                }
            }
        }
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
        if(my_id != undefined) {  //first refresh needs this
            for (var i = 0; i < users[my_id].friends.length; i++) { //my friends
                for (var j = 0; j < _.keys(users).length; j++) {    //objects of my friends
                    if (users[my_id].friends[i].username == users[_.keys(users)[j]].username) {
                        // username which went offline , friends which are friends of target for iterate over them
                        users[_.keys(users)[j]].socket.emit('goes offline', {
                            username: users[my_id].username,
                            'friends': users[_.keys(users)[j]].friends
                        });
                    }
                }
            }
        }
        //io.sockets.emit('goes offline', {username: users[my_id].username, 'friends': );
        //client.emit('goes offline', )
        console.log('user disconnected');
    });

    client.on('error', function(){
        console.log("ERRRO");
        console.log(arguments);
    })
});


app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));


