var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var usernumber = 0;
var userMap = new Map();
var colorMap = new Map();
var messageArray = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/client.js', (req, res) => {
  res.sendFile(__dirname + '/client.js');
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
});


io.on('connection', (socket) => {

  //Set up initial user color.
    colorMap.set(socket, "#000000");

  //Refresh chat to supply user with all past messages.
    socket.emit('checkCookies');

    socket.on('chat message', (msg, username) => {
      if(msg.startsWith("/name"))
      {
        let arr = msg.split(" ");
        let newUserName = arr[1];
        if(!Array.from(userMap.values()).includes(newUserName))
        {
          userMap.set(socket, newUserName);
          socket.emit('username', newUserName);
          io.emit('usernameList', Array.from(userMap.values()));
          for(let i = 0; i < messageArray.length; i++)
          {
            if(messageArray[i].user === username)
            {
              messageArray[i].user = userMap.get(socket);
            }
          }
          io.emit('chat refresh', messageArray);
        }
      }
      else if(msg.startsWith("/color"))
      {
        let arr = msg.split(" ");
        let color = arr[1];
        if(!color.includes('#'))
        {
            color = '#' + color;
        }
        if(color.length != 7 )
        {
           color = '#000000';
        }
        colorMap.set(socket, color);
        for(let i = 0; i < messageArray.length; i++)
        {
            if(messageArray[i].user === username)
            {
              messageArray[i].color = colorMap.get(socket);
            }
        }
        socket.emit('color', color);
        io.emit('chat refresh', messageArray);
      }
      else
      {
        let ts = new Date().toLocaleTimeString("en-US");
        let cl = colorMap.get(socket);
        msg = msg.replace(':)', '😁');
        msg = msg.replace(':(', '🙁');
        msg = msg.replace(':o', '😲');
        
        messageArray.push(
          {
            user: username,
            message: msg,
            color: cl,
            timeStamp: ts,
          }
        )

        if(messageArray.length > 200)
        {
          messageArray.shift();
          io.emit('chat refresh', messageArray);
        }
        io.emit('chat message', "[" + ts + "] <span style=\"color: "+ cl + "\">" + username + "</span>: " + msg, username);
      }
    });

    socket.on('disconnect', () => {
      userMap.delete(socket);
      io.emit('usernameList', Array.from(userMap.values()));
    });

    socket.on('cookieResponse', (responseUsername, responseColor) =>
    {
       //Set up inital username
       let username;
      if(responseUsername === "" || responseUsername === null || responseUsername == undefined || Array.from(userMap.values()).includes(responseUsername))
      {
        username = 'User' + usernumber;
        usernumber++;
      }
      else
      {
        username = responseUsername;
      }

      console.log("A new user connected: " + username);
      socket.emit('username', username);
      userMap.set(socket, username);
      io.emit('usernameList', Array.from(userMap.values()));

      colorMap.set(socket, responseColor);

      io.emit('chat refresh', messageArray);
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});