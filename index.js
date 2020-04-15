const express = require("express");
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let bSpeed = 1;

let ball = {x: 400, y: 500, radius: 10};

let users = 0;

let pause = false;

let dx = bSpeed;
let dy = -bSpeed;

let player1 = {w: 10, h: 80, x: 50, y: 300};
let player2 = {w: 10, h: 80, x: 750, y: 300};

let user = 0;



app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

function ballWallCollision() {
    if ((ball.y + ball.radius) >= 600) {
        dx = -dx
    } else if ((ball.y - ball.radius) <= 0) {
        dx = -dx
    }

}

io.on('connection', function (socket) {
    users++;

    user = users;

    // if (users >= 2) { run game ==> }

    let index = 0;

    socket.on('user-msg', function (msg) {
        socket.broadcast.emit("msg-reply", msg)
    });

    socket.on('playerPos', function (yPos) {
        player1.y = yPos;

        socket.broadcast.emit("getMovement", yPos);

    });

    socket.on('disconnect', function () {
        console.log('a user disconnected');
        users--
    });

    socket.on('playerScore', function (playerScore) {

    });

    socket.on("PlayerBallCollision", function () {
        dx = -dx;
    });

    socket.on("Player2BallCollision", function () {
        dx = -dx;
    });

    socket.on("ballWallCollided", function () {
        dy = -dy
    });

    socket.on("ballLeft", function () {
        dx += -1
    });

    socket.on("ballDown", function () {
        dy += 1
    });

    socket.on("ballRight", function () {
        dx += 1
    });

    socket.on("ballUp", function () {
        dy += -1
    });



    function emitBallPos() {
        // console.log(ball);
        socket.broadcast.emit("ballPos", ball);
    }

    function movement() {
        ball.x += dx;
        ball.y += dy;
    }

    function gameLoop() {
        if (pause !== true) {
            movement();
            emitBallPos();
            ballWallCollision()
    }
    }

    setInterval(gameLoop, 20);

    console.log('a user connected');
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});