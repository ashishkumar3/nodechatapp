const path = require("path");
const http = require("http");
const express = require("express");
const app = express(http);
const socketIO = require("socket.io");

const { generateMessage, generateLocationMessage } = require("./utils/message");

const publicPath = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;

app.use(express.static(publicPath));

const server = http.createServer(app);
const io = socketIO(server); // io => mian connection - server to client

// sockets are users / clients

io.on("connection", socket => {
  console.log("A new user connected"); // on server

  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });

  socket.emit(
    "newMessage",
    generateMessage("Admin", "Welcome to the chat app")
  );
  socket.broadcast.emit(
    "newMessage",
    generateMessage("Admin", "A new user has joined the chat")
  );

  socket.on("createMessage", (message, callback) => {
    // io.emit -> to everysingle connection
    io.emit("newMessage", generateMessage(message.from, message.text));
    callback("This is from the server");
    // socket.broadcast.emit("newMessage", {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });
  });

  socket.on("createLocationMessage", message => {
    io.emit(
      "newLocationMessage",
      generateLocationMessage("Admin", message.latitude, message.longitude)
    );
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
