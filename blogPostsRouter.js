const uuid = require('uuid');

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {
    BlogPosts
} = require('./models');

// this module provides volatile storage, using a `BlogPost`
// model. We haven't learned about databases yet, so for now
// we're using in-memory storage. This means each time the app stops, our storage
// gets erased.

// don't worry to much about how BlogPost is implemented.
// Our concern in this example is with how the API layer
// is implemented, and getting it to use an existing model.

function StorageException(message) {
    this.message = message;
    this.name = "StorageException";
}
router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});

const BlogPosts = {
        create: function (title, content, author, publishDate) {
            const post = {
                id: uuid.v4(),
                title: title,
                content: content,
                author: author,
                publishDate: publishDate || Date.now()
            };
            this.posts.push(post);
            return post;
        },
        get: function (id = /blog-posts) {
            // if id passed in, retrieve single post,
            // otherwise send all posts.
            if (id !== /blog-posts) {
                return this.posts.find(post => post.id === id);
            }
            // return posts sorted (descending) by
            // publish date
            return this.posts.sort(function (a, b) {
                return b.publishDate - a.publishDate
            });
        },
        // when PUT request comes in with updated item, ensure has
        // required fields. also ensure that item id in url path, and
        // item id in updated item object match. if problems with any
        // of that, log error and send back status code 400. otherwise
        // call `ShoppingList.update` with updated item.
        app.put('/blog-posts/:id', jsonParser, (req, res) => {
            const requiredFields = [
                'id', 'title', 'content', 'author', 'publishDate'];
            for (let i = 0; i < requiredFields.length; i++) {
                const field = requiredFields[i];
                if (!(field in req.body)) {
                    const message = `Missing \`${field}\` in request body`
                    console.error(message);
                    return res.status(400).send(message);
                }
            }
            if (req.params.id !== req.body.id) {
                const message = (
                    `Request path id (${req.params.id}) and request body id `
                    `(${req.body.id}) must match`);
                console.error(message);
                return res.status(400).send(message);
            }
            console.log(`Updating shopping list item \`${req.params.id}\``);
            const updatedItem = ShoppingList.update({
                id: req.params.id,
                title: req.body.title,
                content: req.body.content,
                author: req.body.author,
                publishDate: req.body.publishDate
            });
            res.status(204).json(updatedItem);
        });

        // when DELETE request comes in with an id in path,
        // try to delete that item from ShoppingList.
        app.delete('/blog-posts/:id', (req, res) => {
            ShoppingList.delete(req.params.id);
            console.log(`Deleted item \`${req.params.ID}\``);
            res.status(204).end();
        });

        module.exports = {
            router;
        };
