var username;
        
$(function () {
  var socket = io();

  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val(), username);
    $('#m').val('');
    return false;
  });
  
  
  socket.on('chat message', function(msg, user){
    if(user === username)
    {
      $('#messages').append($('<li>').html('<b>' + msg + '</b>'));
    }
    else
    {
      $('#messages').append($('<li>').html(msg));
    }
    window.scrollTo(0,document.body.scrollHeight);
  });

  socket.on('chat refresh', function(msgArray){
    $('#messages').empty();
    for(let i = 0; i < msgArray.length; i++)
    {
      if(msgArray[i].user === username)
      {
        $('#messages').append($('<li>').html("<b>[" + msgArray[i].timeStamp + "] <span style=\"color: "+ msgArray[i].color + "\">" + msgArray[i].user + "</span>: " + msgArray[i].message + "</b>"));
      }
      else
      {
        $('#messages').append($('<li>').html("[" + msgArray[i].timeStamp + "] <span style=\"color: "+ msgArray[i].color + "\">" + msgArray[i].user + "</span>: " + msgArray[i].message));
      }
    }
    window.scrollTo(0,document.body.scrollHeight);
  });

  socket.on('username', function(name){
    username = name;
    document.cookie = "username=" + username;
    $('#username').html(username);
  });

  socket.on('color', function(c){
    document.cookie = "color=" + c;
  });

  socket.on('usernameList', function(userList){
    $('#users').empty();
    for(user of userList)
    {
        $('#users').append($('<li>').text(user));
    }
  });
  
  socket.on('checkCookies', function(){
    let cookieUsername = "";
    console.log(document.cookie);
    if(document.cookie != "")
    {
      cookieUsername = document.cookie.split('; ').find(row => row.startsWith('username')).split('=')[1];
    }

    let cookieColor="";
    if(document.cookie.split('; ').find(row => row.startsWith('color')) != undefined)
    {
      cookieColor = document.cookie.split('; ').find(row => row.startsWith('color')).split('=')[1];
    }
    console.log(cookieColor);
    socket.emit('cookieResponse', cookieUsername, cookieColor);
  });
});