// Client side
const socket = io();

// Socket Events

socket.on("connect", function() {
  console.log("connected to server");
});

socket.on("disconnect", function() {
  console.log("disconnected from server");
});

socket.on("newMessage", function(message) {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let template = jQuery("#message-template").html();
  let html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });
  jQuery("#messages").append(html);
});

socket.on("newLocationMessage", function(message) {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let template = jQuery("#location-template").html();
  let html = Mustache.render(template, {
    location: message.url,
    from: message.from,
    createdAt: formattedTime
  });
  jQuery("#messages").append(html);
});

// JQuery

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
