"use strict";

$(function () {
    var setPivot = function setPivot(resultdata) {
        var derivers = $.pivotUtilities.derivers;
        var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers);
        $("#output").pivotUI(resultdata, {
            renderers: renderers,
            rendererName: "Table"
        });
        localStorage.setItem("Deazz_dash", JSON.stringify(resultdata));
    };
    var getPivot = function getPivot() {
        $.ajax({
            url: '/data', cache: true, dataType: 'json', method: 'POST', success: function success(result, status, xhr) {
                var rep = new RegExp("Date", "g");
                result = _.map(result, function (res) {
                    for (var o in res) {
                        if (rep.test(o)) {

                            var moment_date = moment(res[o]);
                            res[o.replace(rep, "Month")] = moment_date.format("MMMM");
                            res[o.replace(rep, "Day")] = moment_date.format("D");
                            res[o.replace(rep, "Year")] = moment_date.format("YYYY");
                            res[o.replace(rep, "AM/PM")] = moment_date.format("A");
                            delete res[o];
                        }
                    }
                    return res;
                });
                var displaydata = mapdata(result);

                var splitregex = new RegExp("_", "g");

                displaydata[0] = _.map(displaydata[0], function (d) {
                    return d.replace(splitregex, " ");
                });
                setPivot(displaydata);
            }, error: function error(xhr, status, _error) {
                console.dir(_error);
            }
        });
    };

    var mapdata = function mapdata(resultdata) {
        var keys = function keys(resultdata) {
            var res = [];
            for (var o in resultdata[0]) {
                res.push(o);
            }
            return res;
        };
        if (false == null) {
            console.dir("problem");
        }
        var mappeddata = _.map(resultdata, function (obj) {
            var res = [];
            for (var o in obj) {
                if (obj[o] == null) {
                    obj[o] = '';
                }
                res.push(obj[o]);
            }
            return res;
        });
        mappeddata.unshift(keys(resultdata));
        console.dir(mappeddata);
        return mappeddata;
    };

    if (typeof Storage !== "undefined") {
        // Code for localStorage/sessionStorage.
        var maindata = JSON.parse(localStorage.getItem("Deazz_dash"));
        if (maindata) {
            console.dir(maindata);
            var splitregex = new RegExp("_", "g");
            maindata[0] = _.map(maindata[0], function (d) {
                return d.replace(splitregex, " ");
            });
            setPivot(maindata);
        } else {
            getPivot();
        }
    } else {
        // Sorry! No Web Storage support..
        alert("no webstorage support");
        getPivot();
    }

    //        $(".pvtUi > tbody > tr:last-child > td:first-child>li ").after().appendTo("#options");
});