const path = require("path");
const express = require('express');
const app = express();
const port = 3002;

const logger = (req, res, next) => {
    console.log("got request");
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next();
};

app.set("view engine", 'pug');
app.set("views", path.join(__dirname, "views"));

app.use(express.static('public'));
app.use(logger);

app.get('/express/', (req, res) => {
    res.send("made it to express");
});

app.get('/test/:user/', (req, res) => {
    var user = req.params.user;
    res.render("index", {
        user: user
    });
})


app.listen(port, () => console.log(`listening on port ${port}`));
