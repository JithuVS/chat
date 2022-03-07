const socket = io();

//Elements
const $messageForm = document.getElementById("messageform");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.getElementById("sendlocation");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

//Templates
const messageTemplate = document
  .querySelector("#message-template")
  .innerHTML.trim();

const locationMessageTemplate = document
  .querySelector("#location-message-template")
  .innerHTML.trim();

const sidebarTemplate = document
  .querySelector("#sidebar-template")
  .innerHTML.trim();

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = html;
  $messages.insertAdjacentElement("beforeend", htmlObject);

  autoscroll();
});

socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = html;
  $messages.insertAdjacentElement("beforeend", htmlObject);

  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = html;
  $sidebar.innerHTML = '';
  $sidebar.insertAdjacentElement("beforeend", htmlObject);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log("Message Delivered");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by browser!");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit(
  "join",
  {
    username,
    room,
  },
  (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  }
);
