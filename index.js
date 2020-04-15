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
let score = {
    p1: 0,
    p2: 0
};
let user = 0;

function ballWallCollision() {
    if ((ball.y + ball.radius) >= 600) {
        dy = -dy;
    } else if ((ball.y - ball.radius) <= 0) {
        dy = -dy;
    }

}

function newGame() {
    player1.y = 300;
    player2.y = 300;
    ball.x = 400;
    ball.y = 500;
    dx = 2;
    dy = -2
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    users++;

    user = users;

    if (user === 1) {
        socket.emit("user", user);
    } else if (user === 2) {
        socket.emit("user", user);
    }

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

    function winLose() {
        if ((ball.x + ball.radius) >= 800) {
            score.p1++;
            socket.broadcast.emit("score", score);
            newGame();
        } else if ((ball.x - ball.radius) <= 0) {
            score.p2++;
            socket.broadcast.emit("score", score);
            newGame();
        }

    }

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
            ballWallCollision();
            winLose();
    }
    }

    setInterval(gameLoop, 20);

    console.log('a user connected');
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});