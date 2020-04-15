const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const displayBox = document.getElementById("display");
const socket = io();

let lives = 3;

let dir = 0;

let user = 0;

let playerScore = 0;
let enemyScore = 0;
let highScore = 0;

let ball = {};

if (window.localStorage.getItem("hScore") !== null) {
    highScore = window.localStorage.getItem("hScore");
}

socket.on('connect', function () {
    console.log("CONNECTED TO SOCKET");
});

socket.on('event', function (data) {
    console.log("SOCKET EVENT FIRED:", data);
});

socket.on('disconnect', function () {
    console.log("DISCONNECTED");
});

$(function () {
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('user-msg',);
        $('#messages').append($('<li>').text($('#m').val()));
        $('#m').val('');
        return false;
    });
    socket.on('msg-reply', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });


    socket.on('getMovement', function (yPos) {
        enemy.y = yPos;
    });

    socket.on("ballPos", function (ballObject) {
        // console.log("..............");
        ball = ballObject;
        // console.log(ballObject, "ballObject");
        ball.x = ballObject.x;
        ball.y = ballObject.y;
        ball.r = ballObject.radius;
    });

});

document.addEventListener("keydown", function (e) {
    switch (e.code) {
        case "Numpad1":
            socket.emit("ballLeft");
            break;
        case "Numpad2":
            socket.emit("ballDown");
            break;
        case "Numpad3":
            socket.emit("ballRight");
            break;
        case "Numpad5":
            socket.emit("ballUp");
    }
});

function playerBallCollision(p) {
    if ((ball.x + ball.radius) > p.x) {
        if ((ball.y + ball.radius) > p.y && (ball.y - ball.radius) < (p.y + p.h)) {
            socket.emit("PlayerBallCollision")
        }
    }
}

function enemyBallCollision(p) {
    if ((ball.x - ball.radius) < (p.x + p.w)) {
        if ((ball.y + ball.radius) > p.y && (ball.y - ball.radius) < (p.y + p.h)) {
            socket.emit("player2BallCollision")
        }
    }
}

let pause = false;

let enemy = {w: 10, h: 80, x: 50, y: 300};
let player = {w: 10, h: 80, x: 750, y: 300};

document.addEventListener("keydown", function (e) {
    if (e.code === "ShiftLeft") {
        if (e.code === "ArrowUp") {
            dir = -4;
            console.log("Shift Up");
        }
    } else if (e.code === "ArrowUp") {
        console.log("Up");
        dir = -3
    }
    if (e.code === "ShiftLeft") {
        if (e.code === "ArrowDown") {
            console.log("Shift Down");
            dir = 4;
        }
    } else if (e.code === "ArrowDown") {
        dir = 3;
        console.log("Down");
    }
    if (e.code === "KeyP") {
        if (pause === false) {
            pause = true;
        } else if (pause === true) {
            pause = false;
        }
    }
});

document.addEventListener("keyup", function () {
    dir = 0;
});

function loopIndexJS() {
    socket.emit("loopIndex")
}

function drawPlayer() {
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(player.x, player.y, player.w, player.h);
}


function display() {
    displayBox.innerText = `P1: ${playerScore} \xa0 P2: ${enemyScore} \xa0 High Score: x \xa0 Lives: ${lives}`
}

function drawNet() {
    let y = 0;
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = "rgb(230, 230, 230)";
        ctx.fillRect(canvas.width / 2, y, 8, 50);
        y += 65
    }
}

function drawEnemy() {
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
}

function minMaxPaddlePosition(p) {
    if (p.y > (canvas.height - p.h)) {
        p.y = (canvas.height - p.h)
    } else if (p.y < 0) {
        p.y = 0
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fill();
    ctx.closePath();
}

function movement() {
    player.y += dir;
}


function update(progress) {
    playerBallCollision(player);
    enemyBallCollision(enemy);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movement();
    minMaxPaddlePosition(player);
    minMaxPaddlePosition(enemy);
    winLose();
    display();
    emitPlayerPosition(player.y);
    loopIndexJS();
    console.log(canvas.height);
}

function emitPlayerPosition(yPos) {
    // console.log('emit y', yPos);
    socket.emit('playerPos', yPos);
}

function draw() {
    drawPlayer();
    drawEnemy();
    drawBall();
    drawNet();
}

function winLose() {
    if ((ball.x + ball.radius) > canvas.width) {
        enemyScore++;
        lives--;
        if (lives <= 0) {
            // ONCLICK: location.reload();
            pause = true;

        }
    } else if ((ball.x - ball.radius) < 0) {
        playerScore++;
    }
}


function loop(timestamp) {
    let progress = timestamp - lastRender;

    if (pause !== true) {
        update(progress);
        draw();
    }

    lastRender = timestamp;
    window.requestAnimationFrame(loop)
}

let lastRender = 0;
window.requestAnimationFrame(loop);