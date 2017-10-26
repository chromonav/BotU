require('dotenv').config()
var express = require('express')
    , exphbs = require('express-handlebars')
    , morgan = require('morgan')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , app = express()
    , port = process.env.PORT || 8000
    , router = express.Router()
    , moment = require("moment");
var google = require("google")
var cookieParser = require('cookie-parser')

var md5 = require('md5');

google.resultsPerPage = 5
// mysql connection
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "35.201.179.83",
    user: "root",
    password: "hello1234",
    database: "project"
});

connection.connect(function (err) {
    if (err) {
        console.dir(err)
    } else {
        console.log("Connected");
    }
})



var session = require('express-session');
const request = require("request");
const _ = require("lodash")

/* BOT STUFF */
const RiveScript = require("rivescript")
var bot = new RiveScript();





bot.loadFile("brain/test.rive", (batch_num) => {
    console.log("Batch #" + batch_num + " has finished loading!");
    // Now the replies must be sorted!
    bot.sortReplies();
    // And now we're free to get a reply from the brain!
}, (err) => {
    console.log("Error when loading files: " + error);
});

/* ROUTE STUFF */
app.use(morgan('dev'));                     // log every request to the console
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(methodOverride());                  // simulate DELETE and PUT
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(session({
    secret: '016F9D5F268654BB20B1691BFFAFBC88B0EC6DC8A1318B314D467AC84A489056',
    resave: true,
    saveUninitialized: true,
    proxy: true,
    resave: true,
}));

app.use('/', router);
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(function (req, res, next) {
    res.status(404).render("404")
})

router.get('/', function (req, res, next) {
    res.render('index', { isSession: req.session.username ? true : false });
});

router.get('/signin', function (req, res, next) {
    res.render('signin', { isSession: req.session.username ? true : false });
});

router.get('/admin', function(req, res) {
    res.render('adminlogin');
})

router.post('/adminlogin', function(req, res, next) {

})

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/register', function (req, res, next) {
    var uname = req.body.uname;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var mob = req.body.mob;
    var add = req.body.address;
    var epass = md5(req.body.pass);

    var QUERY_STRING = `INSERT INTO user(username, password, fname, lname, address, mob) VALUES("${uname}","${epass}","${fname}","${lname}","${add}","${mob}");`

    connection.query(QUERY_STRING, function (err, rows, fields) {
        if (!err) {
            console.log("Inserted new User");
            res.redirect('/signin');
        } else {
            console.log("Error while registering user ");
            console.log(err);
        }
    })
})

router.post('/signin', function (req, res, next) {
    console.dir(req.body)
    if (isAuth(req.body)) {
        req.session.username = req.body.username;
        req.session.password = req.body.password;
        // console.dir(req.session)
        res.redirect('/')
    } else {
        res.render('signin', { error: "Wrong Username or Password" })
    }
})

router.post('/reply', function (req, res, next) {
    bot.setSubroutine("my_name", function (rs, args) {
        console.dir(args)
        res.cookie("name", args[0])
        return `hello ${args[0]}\n Where do you live?`
    })
    bot.setSubroutine("my_loc", function (rs, args) {
        console.dir(args)
        res.cookie("location", args[0])
        return `Great!\n How can i help you?`
    })

    bot.setSubroutine("find_product_in_store", function (rs, args) {
        console.dir(args)
        return new bot.Promise(function (resolve, reject) {
            connection.query(`select p.*,s.* from products p inner join store_products sp on sp.pid = p.pid inner join stores s on s.sid = sp.sid where p.pname="${args[0]}";`, function (err, row, fields) {
                if (err) {
                    console.dir(err)
                    reject("some error")
                }
                console.dir(row.length)
                if (row.length == 0) {
                    reject("NO RESULT")
                } else {
                    resolve(`${row[0].sname}.<br\> It is near ${row[0].address} <br\>It's price is ${row[0].price}`)
                }
                // resolve(`${row[0].sname} located in ${row[0].address}`)
            })
        })
    })

    // console.dir(req.body)
    bot.replyAsync(req.cookies.name ? req.cookies.name : "new-user", req.body.message, this, function (error, reply) {
        // console.dir(reply)
        if (error) {
            if (error == "NO RESULT") {
                //         res.send()
                // res.send("no result")
                google(`${req.body.message} near ${req.cookies.location}`, function (err, results) {
                    var search_res = "";
                    results.links.map(function (link, val) {
                        if (link.link) {
                            search_res = search_res + `<ul>
                    <a href="${link.link}"><li>
                    <p>${link.title}</p>
                    <p>${link.description}</p>
                    </li></a>
                </ul>`
                        }
                    })

                    console.dir(search_res)
                    res.send(`<p>
                    We could not find resluts in our database. Here are google search results: 
                    </p><br/> ${search_res}
                    `)
                })



            } else {
                console.dir("Error");
                console.dir(req.body)
                console.dir(req.cookies.name)
            }
        } else {
            res.send(reply)
            if (req.cookies.name) {
                var query = `insert into conversation(status,user,message,reply) values(${1},"${req.cookies.name}","${req.body.message}","${reply}")`
                connection.query(query, function (err, row, fields) {
                    console.dir(err)
                })
            }
        }
    })
})


router.get('/signout', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err)
        } else {
            // console.log('logout')
            res.redirect('/')
        }
    })
})

router.get('/admin', ensureAuth, function (req, res) {
    res.render("admin", { isSession: req.session.username ? true : false });
})
var server = app.listen(port);




router.get('/products/:id?', function (req, res) {
    var i = req.params.id;
    if (!i) {
        //code for all products 
        connection.query("select * from products", (err, rows, fiels) => {
            res.render("products", { data: rows, canadd: false, storeid: 0 });
        })
    } else {
        //code for specific store-products
        console.dir(parseInt(i))

        connection.query("select a.* from products a, store_products b where b.pid=a.pid and b.sid=?", i, (MAINerr, MAINrows, MAINfields) => {
            connection.query(`select * from stores where sid=?`, parseInt(i), function (err, rows, fields) {
                if (err || MAINerr) {
                    console.dir(err)
                    console.dir(MAINerr)
                    res.render('404', { url: req.url });
                } else {
                    res.render("products", { storename: fields[0].sname, data: MAINrows, canadd: true, storeid: i });
                }
            })
        })
    }
})

router.get('/addproducts', function (req, res) {
    connection.query("SELECT sname FROM stores", (err, rows, fields) => {
        res.render("addproducts", { data: rows, success: false });
    });

})

router.post('/addp', function (req, res, next) {
    connection.query(`INSERT INTO products(pname, price) VALUES("${req.body.newProduct}", "${req.body.newPrice}")`, function (err, rows, fields) {
        if (err) {
            console.log("Error while inseritng new product")
            console.log(err);
        } else {
            var sql = "select pid from products where pname='" + req.body.newProduct + "' and price=" + req.body.newPrice;
            var sql2 = "select sid from stores where sname='" + req.body.sname + "'";
            connection.query(sql, function (err, rows, fields) {
                var pid = rows[0].pid;
                connection.query(sql2, function (err, rows, fields) {
                    var storeid = rows[0].sid;
                    connection.query(`INSERT INTO store_products VALUES(?, ?)`, [storeid, pid], function (err, rows, fields) {
                        if (err) {
                            console.log("Error while adding product in store_products table");
                        } else {
                            console.log("Success");
                            connection.query("SELECT sname FROM stores", (err, rows, fields) => {
                                res.render("addproducts", { data: rows, success: true });
                            });
                        }
                    })
                })

            })
        }
    })
})

router.post('/addProduct', function (req, res, next) {
    console.log("Store id = " + req.body.storeid);
    var storeid = req.body.storeid;
    var path = "products/" + storeid;
    connection.query(`INSERT INTO products(pname, price) VALUES("${req.body.newProduct}", "${req.body.newPrice}")`, function (err, rows, fields) {
        if (err) {
            console.log("Error while adding product in products table");
        } else {
            var sql = "select pid from products where pname='" + req.body.newProduct + "' and price=" + req.body.newPrice;
            console.log(sql);
            connection.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log("Error while getting pid");
                } else {
                    var pid = rows[0].pid;
                    console.log(pid);
                    connection.query(`INSERT INTO store_products VALUES(?, ?)`, [storeid, pid], function (err, rows, fields) {
                        if (err) {
                            console.log("Error while adding product in store_products table");
                        } else {
                            //console.log("Success");
                            res.redirect(path);
                        }
                    })
                }
            })
        }
    })
})

router.post('/deleteProduct', function (req, res, next) {
    var storeid = req.body.storeid;
    var path = "products/" + storeid;
    console.log(path);
    connection.query(`delete from store_products where pid="${req.body.delid}"`, function (err, rows, fields) {
        if (!err) {
            connection.query(`DELETE FROM products WHERE pid="${req.body.delid}"`, function (err, rows, fields) {
                if (!err)
                    res.redirect(path);
                else
                    console.log("Error while deleting from products");
            })
        } else {
            console.log("Error while deleting data product");
        }
    })
})

router.get('/stores', function (req, res) {
    connection.query("select * from stores", (err, rows, fiels) => {
        res.render("stores", {
            data: rows.map((row) => {
                console.dir(row)
                var el = row;
                el.href = `/products/${row.sid}`
                return el
            })
        });
    })
})
// router.get('/store-products/:id', function(req, res){
//    var i = req.params.id;

// })

router.post('/addStore', function (req, res, next) {
    if (connection.query(`insert into stores(sname, address) values("${req.body.newStore}", "${req.body.newLocation}")`)) {
        res.redirect("stores");
    }
})

router.post('/deleteStore', function (req, res, next) {
    if (connection.query(`delete from stores where sid="${req.body.delid}"`)) {
        res.redirect('stores');
    } else {
        console.log("Error while deleting data product");
    }
})

const isAuth = function (details) {
    // console.dir(details)
    return new Promise(function (resolve, reject) {
        var epass = md5(details.password);

        connection.query(`select * from user where username="${details.username}" and password="` + epass + `"`, function (err, rows, fields) {
            if (err || rows.length < 1) {
                console.dir(err);
                reject(false)
            } else {
                console.dir(rows)
                // console.dir(fields)
                resolve(true)
            }
        })
    })
}

function ensureAuth(req, res, next) {
    if (req.session.username) {
        isAuth({ username: req.session.username, password: req.session.password }).then(function () {
            next()
        }).catch(function () {
            res.redirect('/signin')
        })
    } else {
        res.redirect('/signin')
    }
}

var io = require('socket.io').listen(server);
var SessionSockets = require('session.socket.io'),
    sessionSockets = new SessionSockets(io, session, cookieParser);
sessionSockets.on('connection', function (socket) {
    // google("flower near kothrud", function (err, res) {

    //     var search_res = "";
    //     res.links.map(function (link, val) {
    //         if(link.link){
    //             search_res = search_res + `<ul>
    //             <a href="${link.link}"><li>
    //             <p>${link.title}</p>
    //             <p>${link.description}</p>
    //             </li></a>
    //         </ul>`
    //         }

    //     })
    //     socket.emit("chat_reply", {
    //         text: `<p>
    //     We could not find resluts in our database. Here are google search results: 
    //     </p><br/> ${search_res}
    //    ` })

    //     console.dir(res.links)
    // })
    console.dir(Object.keys())
    socket.emit("chat_reply", { text: "Hello Sir, I am Ubot. What is your name?" })
    socket.on("client_message", function (data) {
        console.dir(data)
        bot.replyAsync("local-user", data.text, this, function (error, reply) {
            if (!error) {
                socket.emit("chat_reply", { text: reply })

                // connection.query(`insert into question()`)
                // you can use reply here
            } else {
                if (error = "NO RESULT") {

                    google(`${data.text}`, function (err, res) {

                        var search_res = "";
                        res.links.map(function (link, val) {
                            if (link.link) {
                                search_res = search_res + `<ul>
                <a href="${link.link}"><li>
                <p>${link.title}</p>
                <p>${link.description}</p>
                </li></a>
            </ul>`
                            }

                        })
                        socket.emit("chat_reply", {
                            text: `<p>
        We could not find resluts in our database. Here are google search results: 
        </p><br/> ${search_res}
       ` })

                        console.dir(res.links)
                    })
                }
                socket.emit("chat_reply", { text: error })

            }
        });

    })
})
