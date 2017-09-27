var socket = io('http://localhost:8000/');

socket.on('chat_reply', function (data) {
    console.log(data);
    $(".messages").append(`
                  <li class="message left appeared">
            <div class="avatar"></div>
            <div class="text_wrapper">
                <div class="text">${data.text}</div>
            </div>
        </li>
    `)
});

$(document).ready(function () {
    $('#send').click(function () {
        var message = $(".message_input").val()
        socket.emit("client_message", {
            text: message
        })
        $(".message_input").val("")
        $(".messages").append(`
        <li class="message right appeared">
            <div class="avatar"></div>
            <div class="text_wrapper">
                <div class="text">${message}</div>
            </div>
        </li>
    `)

    })

})