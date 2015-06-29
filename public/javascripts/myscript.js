'use strict';
console.log('loading!');
//$( document ).ready(function() {
//    $('#modal.ui.modal')
//        .modal("show")
//    ;
//});

var socket = io.connect();
console.log(socket);
socket.on('connection', function() {
    console.log("Hey!");
});