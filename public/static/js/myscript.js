'use strict';
console.log('loading!');

var current_target;

var socket = io.connect();

$( document ).ready(function() {
    $('#modal.ui.modal')
        .modal("show")
    ;
    $('#messages-pane').hide();
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
    if(msg.from_username == current_target || msg.to_username == current_target) {
        $('#messages .ui.minimal.comments').append("<div class='comment'><a class='avatar'><img src=" + "static/avatars/" + msg.from_username + ".jpg" + "></a><div class='content'><a class='author'>" + msg.from_full_name + "</a><div class='metadata'><span class='date'>" + msg.time + "</span></div><div class='text'>" + msg.text + "</div></div></div>");
    }
    if(msg.from_username != current_target){
        if($("#roster a[username=" + msg.from_username + "]").find('div.ui.blue.label').length != 0){
            var number = $("#roster a[username=" + msg.from_username + "]").find('div.ui.blue.label').text();
            console.log(number);
            number++;
            $("#roster a[username=" + msg.from_username + "]").find('div.ui.blue.label').text(number);
        }
        else{
            var number = 1;
            //console.log(number)
            var h = "<div class='ui blue label'>"+number+"</div>";
            $("#roster a[username=" + msg.from_username + "]").append(h);
        }
    }
});

socket.on('add friend success', function(friend){
    console.log("add friend success");
    console.log(new Date());
    $('#roster').append("<a class='active green item' username="+friend.username+"><span>"+friend.username+"</span></a>");
    $("#add_user").val('');
    return false;
});

socket.on('info', function(userObj){
    $('#user-info.ui.raised.stacked.segment h2.ui.icon .content span').html('Welcome, '+userObj.full_name+"!");
    $('#user-info.ui.raised.stacked.segment h2.ui.icon .ui.circular.image').attr("src", "static/avatars/"+userObj.username+".jpg");
    $('#user-info.ui.raised.stacked.segment h2.ui.icon .content .sub.header').html('@'+userObj.username); //<----remained!!!
});

socket.on('friends list', function(friends){   // it remained, for online and unread users
    for(var i = 0 ; i < friends.length ; i++) {
        if(friends[i].status == true) {
            $('#roster').append("<a class='active green item' username=" + friends[i].username + "><span>" + friends[i].username + "</span></a>");
        }
        else{
            $('#roster').append("<a class='blue item' username=" + friends[i].username + "><span>" + friends[i].username + "</span></a>");
        }
    }
});

$('#roster').on("click",'a',function(){
    if($(this).find('div.ui.blue.label').length != 0){
        console.log("has label");
        $('div.ui.blue.label',this).remove();
    }
    current_target = $(this).text();
    $('#messages-pane').show();
    console.log("current_target: "+current_target);
    socket.emit('target message', current_target);
    $('#messages .ui.minimal.comments').html('');
    return false;
});

socket.on('goes offline', function(data){
    if(data != undefined) {
        console.log(data.username + " went offline!");
        $("#roster a[username=" + data.username + "]").removeClass('active green');
        $("#roster a[username=" + data.username + "]").addClass('blue');
    }
});

socket.on('goes online', function(data){
    console.log(data.username+" is online!");
    $("#roster a[username="+data.username+"]").removeClass('blue');
    $("#roster a[username="+data.username+"]").addClass('active green');
});

//$('#info.ui.form.segment').submit(function(){
//    socket.emit('full name', $('#fullname').val());
//    socket.emit('username', $('#username').val());
//    return false;
//});

//console.log(socket);


