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
    $(".messages").animate({ scrollTop: $(".messages").prop('scrollHeight')}, 300);
});

$(document).ready(function () {
    $('.send_message').click(function () {
        var message = $(".message_input").val()
        socket.emit("client_message", {
            text: message
        }
        )
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


$('.message_input').keypress(function (e) {
    if (e.which == 13) {
            var message = $(".message_input").val()
            socket.emit("client_message", {
                text: message
            }
            )
          $(".message_input").val("")
    
            $(".messages").append(`
            
            <li class="message right appeared">
                <div class="avatar"></div>
                <div class="text_wrapper">
                    <div class="text">${message}</div>
                </div>
            </li>
        `)
      return false;    //<---- Add this line
    }
});