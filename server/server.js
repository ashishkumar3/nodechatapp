const path = require("path");
const http = require("http");
const express = require("express");
const app = express(http);
const socketIO = require("socket.io");

const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

const publicPath = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;

app.use(express.static(publicPath));

const server = http.createServer(app);
const io = socketIO(server); // io => mian connection - server to client
const users = new Users();
// sockets are users / clients

io.on("connection", socket => {
  console.log("A new user connected"); // on server

  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage("Gchat", `${user.name} has left the chat`)
      );
    }
  });

  socket.on("join", (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback("Name and room name is required.");
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUserList", users.getUserList(params.room));

    socket.emit("newMessage", generateMessage("Gchat", "Welcome to Gchat"));
    socket.broadcast
      .to(params.room)
      .emit(
        "newMessage",
        generateMessage("Gchat", `${params.name} has joined`)
      );
    callback();
  });

  socket.on("createMessage", (message, callback) => {
    // io.emit -> to everysingle connection
    let user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user.name, message.text)
      );
    }

    callback("This is from the server");
  });

  socket.on("createLocationMessage", message => {
    let user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "newLocationMessage",
        generateLocationMessage(user.name, message.latitude, message.longitude)
      );
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
