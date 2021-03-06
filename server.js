require('dotenv').config()
var express = require('express')
    , exphbs = require('express-handlebars')
    , organ = require('morgan')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , app = express()
    , port = process.env.PORT || 8000
    , router = express.Router()
    , moment = require("moment");
var morgan = require("morgan")
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


function totype(type) {
    if (type == "user") {
        return {
            user: true,
            admin: false
        }
    }
    if (type == "admin") {
        return {
            user: false,
            admin: true
        }
    }
}


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

router.get('/', ensureAuth("user"), function (req, res, next) {
    connection.query(`SELECT fname FROM user WHERE username="${req.session.username}"`, function (err, rows, fields) {
        if (err) {
            console.dir(err)
        } else {
            req.session.name = rows[0]['fname'];
            res.render('index', { type: totype(req.session.type), name: req.session.name });
        }
    })

});

router.get('/signin', function (req, res, next) {
    res.render('signin');
});

router.get('/admin', function (req, res) {
    res.render('adminlogin');
})

router.post('/adminlogin', function (req, res, next) {
    console.dir(req.body)
    if (isAuth({ username: req.body.username, password: req.body.password, type: "admin" })) {
        req.session.username = req.body.username;
        req.session.password = req.body.password;
        req.session.type = 'admin'
        // console.dir(req.session)
        res.redirect('/products')
    } else {
        res.render('signin', { error: "Wrong Username or Password" })
    }
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
    if (isAuth({ username: req.body.username, password: req.body.password, type: "user" })) {
        req.session.username = req.body.username;
        req.session.password = req.body.password;
        req.session.type = 'user'
        // console.dir(req.session)
        res.redirect('/')
    } else {
        res.render('signin', { error: "Wrong Username or Password" })
    }
})

router.post('/reply', ensureAuth('user'), function (req, res, next) {

    bot.setSubroutine("my_loc", function (rs, args) {
        console.dir(args)
        req.session.location = args[0];
        return `Great!\n How can i help you?`
    })

    bot.setSubroutine("find_product_in_store", function (rs, args) {
        console.dir(args)
        console.dir("location = " + req.session.location);
        return new bot.Promise(function (resolve, reject) {
            connection.query(`select p.*,s.* from products p inner join store_products sp on sp.pid = p.pid inner join stores s on s.sid = sp.sid where p.pname="${args[0]}" and s.address like "%${req.session.location}%"; `, function (err, row, fields) {
                if (err) {
                    console.dir(err)
                    reject("some error")
                }
                console.dir(row)
                if (row.length == 0) {
                    connection.query(`SELECT * from unavailableProducts where upname="${args[0]}" and uplocation="${req.session.location}"`, function (err, rows, fields) {
                        if (rows.length == 0) {
                            connection.query(`INSERT INTO unavailableProducts(upname, uplocation) values("${args[0]}", "${req.session.location}");`, function (err, rows, fields) {
                                if (err) {
                                    console.dir("Error while inserting unavailable product" + err)
                                }
                            }
                            )
                        }
                    })
                    reject("NO RESULT")
                } else {
                    resolve(`${row[0].sname}.<br/> It is near ${row[0].address} <br\>It's price is ${row[0].price}`)
                }
                // resolve(`${row[0].sname} located in ${row[0].address}`)
            })
        })
    })
    bot.setSubroutine("find_store", function (rs, args) {
        console.dir(args)
        return new bot.Promise(function (resolve, reject) {
            connection.query(`select p.*,s.* from products p inner join store_products sp on sp.pid = p.pid inner join stores s on s.sid = sp.sid where s.sname="${args[0]}";`, function (err, row, fields) {
                if (err) {
                    console.dir(err)
                    reject("some error")
                }
                console.dir(row)
                if (row.length == 0) {
                    reject("NO RESULT")
                } else {
                    productsdata = ""
                    for (var i = 0; i < row.length; i++) {
                        productsdata = productsdata + `<br/>${row[i].pname} : Rs. ${row[i].price}`
                    }
                    resolve(` <br/> Following are the products available <br/> ${productsdata}`)
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

                google(`${req.body.message} near ${req.session.location}`, function (err, results) {
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

                    //  console.dir(search_res)
                    res.send(`<p>
                    We could not find resluts in our database, We have reported the product to the admin. Till now Here are google search results: 
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
            delete req.session;
            res.redirect('/')
        }
    })
})

router.get('/productsRequests', ensureAuth('admin'), function (req, res) {
    connection.query(`SELECT *from unavailableProducts`, function (err, rows, fields) {
        res.render('productsRequests', { type: totype(req.session.type), data: rows });
    })
})

router.post('/addun', function (req, res) {
    var pid;
    var sid;
    // connection.query(`SELECT *FROM products where pname="${req.body.pname}"`, function(err, rows, fields) {
    //     if(err) { 
    //         console.dir("error at = " +err);
    //     }
    //     if(rows.length != 0) {
    //         console.dir(rows[0].pid)
    //         pid = rows[0].pid;
    //         connection.query(`SELECT * from stores where address like "%${req.body.location}%"`, function(err, row, fields) {
    //             if(row.length != 0) {
    //             if(err) {
    //                 console.dir("errr at retriving = "  + err)
    //             }
    //             console.dir("sid = " + row[0].sid)
    //             console.dir("pid = " + pid)
    //             connection.query(`INSERT INTO store_products(sid, pid) VALUES(${row[0].sid}, ${pid})`, function(err, rows, fields) {
    //                 if(err) {
    //                     console.dir("errro at  = her "+err);
    //                 }
    //                 console.dir("loc=" + req.body.location)
    //                 console.dir("pname=" + req.body.pname)
    //                 connection.query(`DELETE FROM unavailableProducts where upname="${req.body.pname}" and uplocation="${req.body.location}"`, function(err, row, fields) {
    //                     if(err)
    //                         console.dir("Error while deleting = " + err)
    //                     res.redirect('/productsRequests');                        
    //                 } )
    //             } )
    //         }   
    //         })

    //     } else {
    //         connection.query(`INSERT INTO products(pname, price) VALUES("${req.body.pname}", ${req.body.price})`, function(err, rows, fields) {
    //             if(err) 
    //                 console.log(err)
    //             else {
    //                 connection.query(`SELECT *from products where pname="${req.body.pname}"`, function(err, rows, fields) {
    //                     if(err)
    //                         console.log(err)
    //                     else {
    //                         pid = rows[0].pid;
    //                         connection.query(`SELECT *FROM stores where address like "%${req.body.location}%"`, function(err, rows, fileds) {
    //                             sid = rows[0].sid;
    //                             console.log("sid = " + sid);
    //                             console.log("pid = " + pid);
    //                             connection.query(`INSERT INTO store_products VALUES(?, ?)`, [sid, pid], function (err, rows, fields) {
    //                                 if (err) {
    //                                     console.log("Error while adding product in store_products table");
    //                                 } else {
    //                                     res.redirect('/productsRequests');                                                                
    //                                 }
    //                             })
    //                         })
    //                     }
    //                 })
    //             }     
    //         })
    //     }   
    // })
    //connection.query(`INSERT INTO `)

    connection.query(`DELETE FROM unavailableProducts where upname="${req.body.pname}" and uplocation="${req.body.location}"`, function (err, row, fields) {
        if (err)
            console.dir("Error while deleting = " + err)
        res.redirect('/productsRequests');
    })
})

router.get('/products/:id?', ensureAuth('admin'), function (req, res) {
    var i = req.params.id;
    if (!i) {
        //code for all products 
        connection.query("select * from products", (err, rows, fiels) => {
            res.render("products", { type: totype(req.session.type), data: rows, canadd: false, storeid: 0 });
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
                    res.render("products", { type: totype(req.session.type), storename: fields[0].sname, data: MAINrows, canadd: true, storeid: i });
                }
            })
        })
    }
})

router.get('/addproducts', ensureAuth('admin'), function (req, res) {
    connection.query("SELECT sname FROM stores", (err, rows, fields) => {
        res.render("addproducts", { type: totype(req.session.type), data: rows, success: false });
    });

})

router.post('/addp', ensureAuth('admin'), function (req, res, next) {
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

router.post('/addProduct', ensureAuth('admin'), function (req, res, next) {
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

router.post('/deleteProduct', ensureAuth('admin'), function (req, res, next) {
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

router.get('/stores', ensureAuth('admin'), function (req, res) {
    connection.query("select * from stores", (err, rows, fiels) => {
        res.render("stores", {
            type: totype(req.session.type),
            data: rows.map((row) => {
                console.dir(row)
                var el = row;
                el.href = `/products/${row.sid}`
                return el
            })
        });
    })
})

router.post('/addStore', ensureAuth('admin'), function (req, res, next) {
    if (connection.query(`insert into stores(sname, address) values("${req.body.newStore}", "${req.body.newLocation}")`)) {
        res.redirect("stores");
    }
})

router.post('/deleteStore', ensureAuth('admin'), function (req, res, next) {
    if (connection.query(`delete from stores where sid="${req.body.delid}"`)) {
        res.redirect('stores');
    } else {
        console.log("Error while deleting data product");
    }
})



const isAuth = function (details) {
    console.dir("details")
    console.dir(details.type)
    return new Promise(function (resolve, reject) {
        if (details.type == 'user') {
            var epass = md5(details.password);
        } else {
            epass = details.password;
        }
        connection.query(`select * from ${details.type} where username="${details.username}" and password="` + epass + `"`, function (err, rows, fields) {
            console.dir(rows)
            console.dir(fields)
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

function ensureAuth(type) {
    return function (req, res, next) {
        if (req.session.username) {
            isAuth({ username: req.session.username, password: req.session.password, type: type }).then(function () {
                next()
            }).catch(function () {
                console.dir(type)
                if (type == "user") {
                    res.redirect('/signin')
                } else {
                    res.redirect('/admin')
                }
            })
        } else {
            if (type == "user") {
                res.redirect('/signin')
            } else {
                res.redirect('/admin')
            }
        }
    }
}

app.listen(8000)