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
//var socket = io.listen(1223, "1.2.3.4");
server.listen(3000);
console.log("listening on 3000");

function temp_friend(){
    var full_name = undefined;
    var username = undefined;
    var status = undefined;
}

function User() {
    var full_name = undefined;
    var username = undefined;
    var socket;
    var friends = new Array;
    var status;  // true: online, false: offline
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

//database
var mongodb = require('mongodb');
var global_database;
var user_collection;
var message_collection;

var mongo_client = mongodb.MongoClient;

var url = "mongodb://127.0.0.1:27017/chat";
mongo_client.connect(url, function(err, db){
    console.log(err);
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', url);
        // do some work here with the database.
        global_database = db;
        user_collection = global_database.collection('users');
        message_collection = global_database.collection('messages');

        user_collection.find({}).toArray(function(err, result){
            if (err) {
                console.log(err);
            } else if (result.length) {
                console.log(result.length);
                // update my_id remained
                for(var i = 0 ; i < result.length ; i++){
                    var usr = new User();
                    usr.full_name = result[i].full_name;
                    usr.username = result[i].username;
                    usr.friends = result[i].friends;
                    usr.status = result[i].status;
                    users[result[i].my_id] = usr;
                }
                console.log('Found:', result);
                //console.log(result[0].full_name);
            } else {
                console.log('No document(s) found with defined "find" criteria!');
            }
        });

        //db.close();
    }
});

io.sockets.on('connection', function(client){
    console.log(users);
    var usr = new User();
    var target_user;
    var target_user_id;
    var my_id;

    console.log('a user connected');

    client.on('target message', function(target){
        for(var i = 0 ; i < _.keys(users).length ; i++) {
            if(users[_.keys(users)[i]].username == target){
                target_user = users[_.keys(users)[i]];

                for(var j = 0 ; j < messages.length ; j++){
                    if((messages[j].from_username == users[my_id].username && messages[j].to_username == target_user.username)
                        || (messages[j].from_username == target_user.username && messages[j].to_username == users[my_id].username)){
                        client.emit('chat message', messages[j]);
                    }
                }
                console.log(target_user.username);
                target_user_id = _.keys(users)[i];
                break;
            }
        }
    });

    client.on('chat message', function(message){
        var mymsg = {}; //new Message();
        mymsg.from_username = users[my_id].username;//users[client.id];
        mymsg.from_full_name = users[my_id].full_name;//users[client.id];
        mymsg.to_username = target_user.username;
        mymsg.to_full_name = target_user.full_name;
        mymsg.text = message;
        mymsg.time = new Date();
        messages.push(mymsg);
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
                friend.status = true; //default: we can add online friends.
                users[my_id].friends.push(friend);

                user_collection.update({username: users[my_id].username}, {$set:{friends: users[my_id].friends}}, function(err, result){
                   if(err){
                       console.log(err);
                   }
                   else{
                       console.log("friends results: "+result);
                   }
                });

                notFind = true;
                client.emit('add friend success', friend);

                var me = new temp_friend();
                me.full_name = users[my_id].full_name;
                me.username = users[my_id].username;
                me.status = true;
                for(var i = 0 ; i < _.keys(users).length ; i++) {
                    if(users[_.keys(users)[i]].username == friend.username) {
                        users[_.keys(users)[i]].friends.push(me);

                        user_collection.update({username: friend.username}, {$set:{friends: users[_.keys(users)[i]].friends}}, function(err, result){
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log("friends results: "+result);
                            }
                        });

                        console.log("add to target friends successful");
                        users[_.keys(users)[i]].socket.emit('add friend success', me);
                        break;
                    }
                }
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
        usr.status = true;
        var hasUser = false;
        for(var i = 0 ; i < _.keys(users).length ; i++){
            if(users[_.keys(users)[i]].username == userObj.username){
                hasUser = true;
                users[_.keys(users)[i]].socket = client;
                client.emit('friends list', users[_.keys(users)[i]].friends);
                my_id = _.keys(users)[i];
                console.log("be tarz ajibi umad inja");
                break;
            }
        }
        if(!hasUser) { // if we have not this user
            //users[client.id] = usr;
            my_id = client.id;

            ////////////////databese//////////////////
            var user = {full_name: usr.full_name , username: usr.username, my_id: my_id ,status: usr.status, friends: usr.friends};
            user_collection.insert(user, function(err, result){
               if (err){
                   console.log(err);
               }
               else{
                   console.log("Inserted %d user into database", result.length);
               }
            });
            /////////////////////////////////////////
            //user_collection.find({username: "Milad"}).toArray(function(err, result){
            //    if (err) {
            //        console.log(err);
            //    } else if (result.length) {
            //        console.log('Found:', result);
            //    } else {
            //        console.log('No document(s) found with defined "find" criteria!');
            //    }
            //});
            //console.log(users[client.id]);
        }

        client.emit('info', userObj);  //socket just for a user, io for all connected users

        //online handler
        for(var i = 0 ; i < users[my_id].friends.length ; i++){
            for(var j = 0 ; j < _.keys(users).length ; j++){
                if(users[my_id].friends[i].username == users[_.keys(users)[j]].username){
                    // username which went offline , friends which are friends of target for iterate over them
                    if(users[_.keys(users)[j]].socket != undefined) {
                        users[_.keys(users)[j]].status = true;
                        users[_.keys(users)[j]].socket.emit('goes online', {
                            username: users[my_id].username,
                            'friends': users[_.keys(users)[j]].friends
                        });
                    }
                }
            }
        }
    });

    client.on('disconnect', function(){
        if(my_id != undefined && users[my_id] != undefined) {  //first refresh needs this
            for (var i = 0; i < users[my_id].friends.length; i++) { //my friends
                for (var j = 0; j < _.keys(users).length; j++) {    //objects of my friends
                    if (users[my_id].friends[i].username == users[_.keys(users)[j]].username) {
                        // username which went offline , friends which are friends of target for iterate over them
                        if(users[_.keys(users)[j]].socket != undefined) { // friendash bayad online bashan ta befrestam. offline socket e nadare.
                            users[_.keys(users)[j]].status = false;
                            users[_.keys(users)[j]].socket.emit('goes offline', {
                                username: users[my_id].username,
                                status: 0,
                                'friends': users[_.keys(users)[j]].friends
                            });
                        }

                    }
                }
            }
            users[my_id].status = false;
        }
        //io.sockets.emit('goes offline', {username: users[my_id].username, 'friends': );
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


