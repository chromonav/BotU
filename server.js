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

var md5 = require('md5');

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

bot.setSubroutine("find_product_in_store", function (rs, args) {
    console.dir(args)
    return new bot.Promise(function (resolve, reject) {
       connection.query(`select * from stores limit 1`,function(err,row,fields){
           if(err){
               console.dir(err)
               reject("some error")
           }
           console.dir(row)
           resolve(`${row[0].sname} located in ${row[0].address}`)
       })
    })
})

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
app.use(methodOverride());                  // simulate DELETE and PUT
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(session({
    secret: '016F9D5F268654BB20B1691BFFAFBC88B0EC6DC8A1318B314D467AC84A489056',
    resave: false,
    saveUninitialized: true
}));

app.use('/', router);
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(function (req, res, next) {
    res.status(404).render("404")
})

router.get('/', ensureAuth, function (req, res, next) {
    res.render('index', { isSession: req.session.username ? true : false });
});

router.get('/signin', function (req, res, next) {
    res.render('signin', { isSession: req.session.username ? true : false });
});

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

router.post('/register', function(req, res, next) {
    var uname = req.body.uname;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var mob = req.body.mob;
    var add = req.body.address;
    var epass = md5(req.body.pass);

    var QUERY_STRING =`INSERT INTO user(username, password, fname, lname, address, mob) VALUES("${uname}","${epass}","${fname}","${lname}","${add}","${mob}");`

     connection.query(QUERY_STRING,function(err, rows, fields) {
       if(!err){
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

router.get('/reply', ensureAuth, function (req, res, next) {

    var reply = bot.reply("local-user", "Hello, bot!");
    res.send(reply)
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


router.get('/products', function (req, res) {
    connection.query("select * from products", (err, rows, fiels) => {
        res.render("products", { data: rows });
    })
})

router.post('/addProduct', function (req, res, next) {
    if (connection.query(`insert into products(pname, price) values("${req.body.newProduct}", "${req.body.newPrice}")`)) {
        res.redirect("products");
    }
})

router.post('/deleteProduct', function (req, res, next) {
    if (connection.query(`delete from products where pid="${req.body.delid}"`)) {
        res.redirect('products');
    } else {
        console.log("Error while deleting data product");
    }
})

router.get('/stores', function (req, res) {
    connection.query("select * from stores", (err, rows, fiels) => {
        res.render("stores", { data: rows });
    })
})

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

        connection.query(`select * from user where username="${details.username}" and password="`+epass +`"`, function (err, rows, fields) {
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

io.on('connection', function (socket) {
    // socket.emit("chat_reply", { text: "helloe" })
    socket.on("client_message", function (data) {

        bot.replyAsync("local-user", data.text, this, function (error, reply) {
            if (!error) {
                socket.emit("chat_reply", { text: reply })
                // connection.query(`insert into question()`)
                // you can use reply here
            } else {
                socket.emit("chat_reply", { text: error })

            }
        });

    })
})