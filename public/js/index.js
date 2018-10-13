const socket = io();

socket.on("connect", function() {
  console.log("connected to server");
});

socket.on("disconnect", function() {
  console.log("disconnected from server");
});

socket.on("newMessage", function(message) {
  console.log(message);
  let li = jQuery("<li></li>");
  li.text(`${message.from} : ${message.text}`);
  jQuery("#messages").append(li);
});

socket.on("newLocationMessage", function(message) {
  console.log(message.url);
  let li = jQuery("<li></li>");
  let a = jQuery('<a target="_blank">My Location</a>');
  li.text(`${message.from}: `);
  a.attr("href", message.url);
  li.append(a);
  jQuery("#messages").append(li);
});

jQuery("#message-form").on("submit", function(e) {
  e.preventDefault();

  let messageTextBox = jQuery("[name=message");

  socket.emit(
    "createMessage",
    {
      from: "user",
      text: messageTextBox.val()
    },
    function() {
      messageTextBox.val("");
    }
  );
});

let locationButton = jQuery("#send-location");
locationButton.on("click", function() {
  if (!navigator.geolocation) {
    return alert("Goelocation is not supported by your browser");
  }

  locationButton.attr("disabled", "disabled").text("Sending Location...");

  navigator.geolocation.getCurrentPosition(
    function(position) {
      locationButton.removeAttr("disabled").text("Send Location");
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      locationButton.removeAttr("disabled").text("Send Location");
      alert("unable to fetch the location");
    }
  );
});
