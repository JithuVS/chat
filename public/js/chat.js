const socket = io();

//Elements
const $messageForm = document.getElementById("messageform");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.getElementById("sendlocation");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document
  .querySelector("#message-template")
  .innerHTML.trim();

const locationMessageTemplate = document
  .querySelector("#location-message-template")
  .innerHTML.trim();

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message,
  });
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = html;
  $messages.insertAdjacentElement("beforeend", htmlObject);
});



socket.on('locationMessage', (url) => {
  console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    url,
  });
  const htmlObject = document.createElement("div");
  htmlObject.innerHTML = html;
  $messages.insertAdjacentElement("beforeend", htmlObject);
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
