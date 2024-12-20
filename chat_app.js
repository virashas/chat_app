// Connect to the WebSocket Server
const chatSocket = new WebSocket("ws://localhost:8090");
var isSocketConnected = false;

var user_name = localStorage.getItem("userName") || "";

// Messages Bubble
let msgBubble = `<div class="message-item">
<div><span class="text-muted sender-name"></span></div>
<div class="message-content"></div>
</div>`;

// Event when socket is opened
chatSocket.onopen = (event) => {
    // When connection is opened
    isSocketConnected = true;
};

// Function for Sending the Message data to the socket server
function send_msg(JSONData) {
    // Prevent function from executing if socket is not opened successfully
    if (!isSocketConnected) return;
    chatSocket.send(JSON.stringify(JSONData));
}

// Receive Message from socket
chatSocket.onmessage = (event) => {
    // Message Data received from socket server
    var msgData = JSON.parse(event.data) || null;
    if (msgData == null) return;
    if (!msgData.msg) return;
    if (!msgData.user) {
        console.log(msgData.msg);
        return;
    }
    // Show the message data in the conversation box if the user is not the client
    if (msgData.user != user_name) {
        var bubble = $(msgBubble).clone(true);
        bubble.addClass("received");
        bubble.find(".sender-name").text(`${msgData.user}`);
        var content = msgData.msg.replace(/\n/gi, "<br>");
        bubble.find(".message-content").html(content);
        $("#message-items-container").prepend(bubble);
    }
};

// Closing the socket if the window is unloading
window.addEventListener("unload", function () {
    chatSocket.close();
    console.log(chatSocket);
});

// Listen for possible errors
chatSocket.addEventListener("error", (event) => {
    console.log("WebSocket error: ", event);
});

// Function that handles the message data to send
function triggerSend() {
    var msg = $("#msg-txt-field").val();
    msg = msg.trim();
    if (msg == "") return;

    var bubble = $(msgBubble).clone(true);
    bubble.addClass("sent");
    var content = msg.replace(/\n/gi, "<br>");
    bubble.find(".message-content").html(content);
    $("#message-items-container").prepend(bubble);

    $("#msg-txt-field").val("");
    $("#msg-txt-field").focus();
    send_msg({ user: user_name, msg: msg });
}

$(document).ready(function () {
    // Prompt window if user does not exist yet
    if (user_name == "") {
        var enter_user = prompt("Enter Your Name");
        if (enter_user != "") {
            user_name = enter_user;
            localStorage.setItem("userName", user_name);
        } else {
            alert("User Name must be provided!");
            location.reload();
        }
    }
    $("#userName").text(user_name);
    // Event Listener when Send Button is clicked
    $("#send-btn").on("click", triggerSend);

    // Event Listener when Message Text Field is submitted by hitting the Enter Key
    $("#msg-txt-field").on("keypress", function (e) {
        if (e.key == "Enter") {
            e.preventDefault();
            triggerSend();
        }
    });
});
