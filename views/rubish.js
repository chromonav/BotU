var derivers = $.pivotUtilities.derivers;
var renderers = $.extend($.pivotUtilities.renderers,$.pivotUtilities.c3_renderers);

var i;
var paramfilter = function () {
    var $select = $(".filter:not(.btn-success)")
    for (i = 0; i < $select.length; i++) {

    }
}

var mainarr = []
for (i = 0; i < result.length; i++) {
    var arr = []
    for (j = 0; j < result[i].length; j++) {
        arr.push(result[i][j].data)
    }
    mainarr.push(arr);

}

$("#output").pivotUI(mainarr, {
    renderers: renderers,
    rendererName: "Table"
});



$(".filter ").click(function () {
    if ($(this).hasClass("btn-success")) {
        $(this).removeClass("btn-success")
    } else {
        $(this).addClass("btn-success")
    }
    var $select = $(".filter:not(.btn-success)");

    for (var i = 0; i < $select.length; i++) {

        switch ($select[i].id) {
            case "Date":
                var selectedarr = []

                for (var i = 0; i < result.length; i++) {
                    temp = []
                    for (var j = 0; j < result[i].length; j++) {
                        if (result[i][j].type != "Date") {
                            temp.push(result[i][j]);
                            console.dir(temp)
                        }
                    }
                    selectedarr.push(temp)
                }
                console.dir(selectedarr)
                break;
            case "Day":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Day" }) })
                break;
            case "Month":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Month" }) })
                break;
            case "Time":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Time" }) })
                break;
            case "Year":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Year" }) })
                break;
            case "Amount":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Amount" }) })
                break;
            case "Names":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Names" }) })
                break;
            case "Location":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Location" }) })
                break;
            case "Category":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Category" }) })
                break;
            case "Status":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Status" }) })
                break;
            case "Id":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Id" }) })
                break;
            case "Names":
                _.map(selectedarr, function (arr) { return _.filter(arr, function (ele) { return ele.type != "Names" }) })
                break;
        }

    }
    var hello = []
    for (i = 0; i < result.length; i++) {
        var arr = []
        for (j = 0; j < result[i].length; j++) {
            arr.push(result[i][j].data)
        }
        hello.push(arr);
    }
    console.dir(hello)
    $("#output").pivotUI(mainarr, {
        renderers: renderers,
        rendererName: "Table"
    });

})
