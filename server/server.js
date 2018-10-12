const path = require("path");
const http = require("http");
const express = require("express");
const app = express(http);
const socketIO = require("socket.io");

const publicPath = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;

app.use(express.static(publicPath));

const server = http.createServer(app);
const io = socketIO(server); // io => mian connection - server to client

// sockets are users / clients

io.on("connection", socket => {
  console.log("A new user connected");

  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });

  socket.on("createMessage", function(message) {
    // io.emit -> to everysingle connection
    io.emit("newMessage", {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime()
    });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
