// Client side
const socket = io();

// Scroll bar
function scrollToBottom() {
  // Selectors
  let messages = jQuery("#messages");
  let newMessage = messages.children("li:last-child");
  // Heights
  let clientHeight = messages.prop("clientHeight");
  let scrollTop = messages.prop("scrollTop");
  let scrollHeight = messages.prop("scrollHeight");
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

// Socket Events

socket.on("connect", function() {
  const params = jQuery.deparam(window.location.search);

  socket.emit("join", params, function(error) {
    if (error) {
      alert(error);
      window.location.href = "/";
    } else {
      console.log("no error");
    }
  });
});

socket.on("disconnect", function() {
  console.log("disconnected from server");
});

socket.on("updateUserList", function(users) {
  let ol = jQuery("<ol></ol>");
  users.forEach(function(user) {
    ol.append(jQuery("<li></li>").text(user));
  });
  jQuery("#users").html(ol);
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
  scrollToBottom();
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
  //   scrollToBottom();
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
