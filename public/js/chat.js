function send_message() {
    var message = $(".message_input").val()
    $(".messages").append(`  
        <li class="message right appeared">
            <div class="avatar"></div>
            <div class="text_wrapper">
                <div class="text">${message}</div>
            </div>
        </li>
    `)
    $.ajax({
        "url": "/reply",
        method: "POST",
        data: { message: message },
        success: function (data) {
            console.dir("data")
            $(".message_input").val("")

            $(".messages").append(`
        
        <li class="message left appeared">
            <div class="avatar"></div>
            <div class="text_wrapper">
                <div class="text">${data}</div>
            </div>
        </li>
    `)
        }
    })
}
$(document).ready(function () {

    $('.send_message').click(function () {
        send_message()
        $(".messages").animate({   scrollTop: $(".messages").prop('scrollHeight') }, 300);

    })

    $('.message_input').keypress(function (e) {
        if (e.which == 13) {
            send_message()
            $(".messages").animate({ scrollTop: $(".messages").prop('scrollHeight') }, 300);

            return false;    //<---- Add this line
        }
    });


})


