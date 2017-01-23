//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
const morgan = require('morgan');

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());
mongoose.Promise = global.Promise;

var async = require('async');
var socketio = require('socket.io');
const blogPostsRouter = require('./blogPostsRouter');
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
        socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
        sockets.splice(sockets.indexOf(socket), 1);
        updateRoster();
    });

    socket.on('message', function (msg) {
        var text = String(msg || '');

        if (!text)
            return;

        socket.get('name', function (err, name) {
            var data = {
                name: name,
                text: text
            };

            broadcast('message', data);
            messages.push(data);
        });
    });

    socket.on('identify', function (name) {
        socket.set('name', String(name || 'Anonymous'), function (err) {
            updateRoster();
        });
    });
});


app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .exec()
        .find(filters)
        .exec()
        .then(Restaurants => res.json(
            res.json(posts.map(post => post.apiRepr()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            })
        });
});


app.get('/posts/:id', (req, res) => {
    BlogPost
        .findById(req.params.id)
        .exec()
        .then(post => res.json(post.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went wrong'
            });
        });
});

// {
//       "title": "some title",
//       "content": "a bunch of amazing words",
//       "author": "Sarah Clarke",
//       "created": "1481322758429"
//   }

app.post('/post', (req, res) => {

    const requiredFields = ['title', 'content', 'author'];
    requiredFields.forEach(field => {
        // ensure that required fields have been sent over
        if (!(field in req.body && req.body[field])) {
            return res.status(400).json({
                message: `Must specify value for ${field}`
            });
        }
    });

    blogPost
        .create({
                title: "some title",
                content: "a bunch of amazing words",
                author: "Sarah Clarke",
                created: "1481322758429"
            )
        }
        .then(
            blogPost => res.status(201).json(restaurant.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

app.put('/post/:id', (req, res) => {

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    blogPost
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .exec()
        .then(blogPost => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});



app.delete('/post/:id', (req, res) => {
    blogPost
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});


app.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

let server;

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {
    runServer, app, closeServer
};





function updateRoster() {
    async.map(
        sockets,
        function (socket, callback) {
            socket.get('name', callback);
        },
        function (err, names) {
            broadcast('roster', names);
        }
    );
}





function broadcast(event, data) {
    sockets.forEach(function (socket) {
        socket.emit(event, data);
    });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});
