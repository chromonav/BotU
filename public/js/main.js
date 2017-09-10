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
