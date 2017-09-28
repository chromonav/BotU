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

// mysql connection
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "botu"
});

connection.connect(function (err) {
    if (err) {
        console.log("Error connecting db");
    } else {
        console.log("Connected");
    }
})

connection.query("SELECT * FROM stud", function (err, rows, fields) {
    if (err) {
        console.log("error");
    } else {
        console.log("sucess");
    }
})


var session = require('express-session');
const request = require("request");
const _ = require("lodash")
const RiveScript = require("rivescript")
<<<<<<< HEAD
require('dotenv').config()
=======

>>>>>>> a4178b488bfadecf59bdf1ef4f33a0dc1ab9b8f7
var bot = new RiveScript();
bot.loadFile("brain/test.rive", (batch_num) => {
    console.log("Batch #" + batch_num + " has finished loading!");
    // Now the replies must be sorted!
    bot.sortReplies();
    // And now we're free to get a reply from the brain!
}, (err) => {
    console.log("Error when loading files: " + error);
});

<<<<<<< HEAD
=======

>>>>>>> a4178b488bfadecf59bdf1ef4f33a0dc1ab9b8f7
// app.use(morgan('dev'));                     // log every request to the console
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

router.get('/', function (req, res, next) {
    res.render('index', { isSession: req.session.username ? true : false });
});

router.get('/signin', function (req, res, next) {
    res.render('signin', { isSession: req.session.username ? true : false });
});

router.get('/signup', function (req, res, next) {
    res.render('signup');
});

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

<<<<<<< HEAD
name=["hello","hello1","hello2","hello3","hello4",]
router.get('/admin',ensureAuth, function(req, res) {
  res.render("admin",{ isSession: req.session.username ? true : false });
=======

router.get('/admin', ensureAuth, function (req, res) {
    res.render("admin", { isSession: req.session.username ? true : false });
>>>>>>> a4178b488bfadecf59bdf1ef4f33a0dc1ab9b8f7
})
var server = app.listen(port);

<<<<<<< HEAD


router.get('/products', function(req, res) {
  res.render("products");
})

router.get('/stores', function(req, res) {
  res.render("stores");
})


app.listen(port);
=======
>>>>>>> a4178b488bfadecf59bdf1ef4f33a0dc1ab9b8f7
console.log('App running on port', port);

const isAuth = function (details) {
    // console.dir(details)
    if ((details.username == "Deazz" && details.password == "Deazz") || (details.username == "admin" && details.password == "admin")) {
        return true;
    } else return false;
}

function ensureAuth(req, res, next) {
    if (req.session.username) {
        if (isAuth({ username: req.session.username, password: req.session.password })) {
            next()
        } else {
            res.render('signin', { error: "Wrong Password" })
        }
    } else {
        res.redirect('/signin')
    }
}

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {
    socket.emit("chat_reply", { text: "helloe" })
    socket.on("client_message", function (data) {
        var reply = bot.reply("local-user", data.text);
        socket.emit("chat_reply", { text: reply })
    })
})