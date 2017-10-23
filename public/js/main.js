$(window).scroll(function() {
if ($(document).scrollTop() > 150) {
$('.navbar').addClass('shrink');
}
else {
$('.navbar').removeClass('shrink'); }
});


/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function tog() {
    var x = document.getElementById("na");
    if (x.className === "hid") {
        x.className += " clicked";
    } else {
        x.className = "hid";
    }
}


$(document).ready(function() {
  var activeSystemClass = $('.list-group-item.active');

  //something is entered in search form
  $('#system-search').keyup( function() {
     var that = this;
      // affect all table rows on in systems table
      var tableBody = $('.table-list-search tbody');
      var tableRowsClass = $('.table-list-search tbody tr');
      $('.search-sf').remove();
      tableRowsClass.each( function(i, val) {

          //Lower text for case insensitive
          var rowText = $(val).text().toLowerCase();
          var inputText = $(that).val().toLowerCase();
          if(inputText != '')
          {
              $('.search-query-sf').remove();
              tableBody.prepend('<tr class="search-query-sf"><td colspan="6"><strong>Searching for: "'
                  + $(that).val()
                  + '"</strong></td></tr>');
          }
          else
          {
              $('.search-query-sf').remove();
          }

          if( rowText.indexOf( inputText ) == -1 )
          {
              //hide rows
              tableRowsClass.eq(i).hide();

          }
          else
          {
              $('.search-sf').remove();
              tableRowsClass.eq(i).show();
          }
      });
      //all tr elements are hidden
      if(tableRowsClass.children(':visible').length == 0)
      {
          tableBody.append('<tr class="search-sf"><td class="text-muted" colspan="6">No entries found.</td></tr>');
      }
  });
});


$(".data").click(function() {
    console.log("/store-products/" + $("#sid").text());
    $.get("/store-products/" + $("#sid").text());
});

$(".input").click(function() {
    $(".isa_success").css({ "display" : "none"});
})

$(".input").focus(function() {
    $(this).css({
        "border": "none",
        "border-bottom": "2px solid #439EA2",
        "outline": "none"
    })
})
$(".input").focusout(function() {
    $(this).css({
        "border-bottom": "2px solid #B1AEAE",
    })
})


    $("#registration_form").validate({
        rules: {
            fname : {
                required: true,
                minlength: 2,
                lettersonly: true
            },
            lname: {
                required: true,
                minlength: 2,
                lettersonly: true
            },
            uname: {
                required: true
            },
            mob: {
                required: true,
                minlength: 9 ,
                maxlength: 9  
            },

            pass: {
                required: true,
                minlength: 6
            },
            address: {
                required: true,
            }
        },
        messages: {
          mob: {
            required: "We need your mobile number to contact you",
            minlength: jQuery.validator.format("At least {0} characters required!"),
            maxlength: "You can't enter more than 10 digits"
          },
          fname : {
            required : "Please enter your good-name",
            minlength: "Enter valid name",
            lettersonly: "Your name can't have numbers here"
          },
          lname : {
            required : "Please enter your good-name",
            minlength: "Enter valid name",
            lettersonly: "Your name can't have numbers here"
          },
          pass: {
              required: "Password can't be blank",
              minlength: "Password should be atleast 6 character long"
          },
          address: {
              required: "Address can't be blank"
          },
          uname: {
              required: "Please choose some username"
          }
        }
      });