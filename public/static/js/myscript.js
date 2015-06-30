'use strict';
console.log('loading!');

var current_target;

var socket = io.connect();

$( document ).ready(function() {
    $('#modal.ui.modal')
        .modal("show")
    ;
});

$('#myform.ui.form').submit(function(){
    socket.emit('chat message', $('#msg').val());
    $('#msg').val('');
    return false;
});

function User() {
    var full_name = undefined;
    var username = undefined;
}

$('#ok.ui.button').on("click", function(){
    var usr = new User();
    usr.full_name = $('#fullname').val();
    usr.username = $('#username').val();
    socket.emit('join', usr);
    return false;
});

$('#add_user').keypress(function(e){
    if(e.which == 13){ //enter pressed!
        var name = $("#add_user").val();
        if (name != "") {
            //console.log(name);
            socket.emit('add friend', name);
        }
    }
});

socket.on('chat message', function(msg){
    console.log("Chat message: "+msg.text);
    $('#messages .ui.minimal.comments').append("<div class='comment'><a class='avatar'><img src="+"static/avatars/"+msg.from_username+".jpg"+"></a><div class='content'><a class='author'>"+msg.from_full_name+"</a><div class='metadata'><span class='date'>"+msg.time+"</span></div><div class='text'>"+msg.text+"</div></div></div>");
    //console.log(msg);
});

socket.on('add friend success', function(friend){
    console.log("add friend success");
    console.log(new Date());
    $('#roster').append("<a class='blue item'>"+friend.username+"</a>");
    $("#add_user").val('');
    return false;
});

socket.on('info', function(userObj){
    $('#user-info.ui.raised.stacked.segment h2.ui.icon .content span').html('Welcome, '+userObj.full_name+"!");
    $('#user-info.ui.raised.stacked.segment h2.ui.icon .ui.circular.image').attr("src", "static/avatars/"+userObj.username+".jpg");
    $('#user-info.ui.raised.stacked.segment h2.ui.icon .content .sub.header').html('@'+userObj.username); //<----remained!!!
});

socket.on('friends list', function(friends){   // it remained, I don't know how khodemun ba khode jade ham mishe render kard
    for(var i = 0 ; i < friends.length ; i++) {
        $('#roster').append("<a class='blue item'>" + friends[i].username + "</a>");
    }
});

$('#roster').on("click",'a',function(){
    current_target = $(this).html();
    console.log("current_target: "+current_target);
    socket.emit('target message', current_target);
    $('#messages .ui.minimal.comments').html('');
    return false;
});




//$('#info.ui.form.segment').submit(function(){
//    socket.emit('full name', $('#fullname').val());
//    socket.emit('username', $('#username').val());
//    return false;
//});

//console.log(socket);


