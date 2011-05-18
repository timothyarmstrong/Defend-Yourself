/**
 * Just stay alive.
 *
 * @author Timothy Armstrong
 * @copyright August 2010
 */

//////////////////////////////
// LIBRARY
//////////////////////////////


function $(selector) {
	return document.getElementById(selector);
}

function randInt(lowerBound, upperBound) {
	
	return Math.round(Math.random() * (upperBound - lowerBound) + lowerBound);
	
}

CanvasRenderingContext2D.prototype.circle = function(x,y,ra) {
	
	this.beginPath();
	this.arc(x,y,ra,0,Math.PI*2,true);
	this.closePath();
	
	this.fill();
	this.stroke();
	
};

//////////////////////////////
// GLOBALS
//////////////////////////////

var canvas = $('canvas');
var c = canvas.getContext('2d');

var balls = [];
var bullets = [];

var fms = 0;

var nextBallInterval = 90;
var nextBallAt = 30;

var nextBulletInterval = 3;
var nextBulletIntervalEmpty = 9;
var nextBulletAt = false;

var mouseIsDown = false;
var spacebarDown = false;

var gameHeight = 480;
var gameWidth = 640;
var bufferZone = 140;

var originX = gameWidth / 2;
var originY = gameHeight - 75;

var targetX;
var targetY;

var ammo = gameWidth;
var ammoUnit = 5;

var windSpeed = 0;

// colors

var ballFill = '#374c6f';
var ballStroke = '#0c1018';

var bulletFill = '#ccF';
var bulletStroke = 'transparent';

var gameBG = '#17202f';

// statistics
var timeStart = (new Date()).getTime();
var totalBalls = 0;
var totalBullets = 0;

if (window.localStorage) {
	
	var hS = localStorage.getItem('high_scores');
	
	var highScores = [];
	
	if (hS) {
		
		hS = hS.split(',');
		
		for (var i = 0; i < hS.length; i++) {
			
			highScores.push(parseInt(hS[i], 10));
			
		}
		
	} else {
		
		highScores = [];
		
	}
	
}

//////////////////////////////
// OBJECTS
//////////////////////////////

var Ball = function(x, y, ra, vx, vy, stroke, fill) {
	
	this.x = x;
	this.y = y;
	this.ra = ra;
	
	// speed
	this.vx = vx;
	this.vy = vy;
	
	// colors
	this.stroke = stroke;
	this.fill = fill;
	
};

Ball.prototype = {
	
	draw: function() {
		
		c.save();

		c.fillStyle = this.fill;
		c.strokeStyle = this.stroke;

		c.lineWidth = 2;
		
		c.circle(this.x,this.y,this.ra);
		
		c.restore();
		
	},
	
	move: function() {
		
		this.x += this.vx;
		this.y += this.vy;
		
	},
	
	wind: function() {
		
		if (fms > 2000) {
			
			var f = Math.floor(fms/2000);
			
			if (f%2 == 0) {
				windSpeed = 0.2;
			} else {
				windSpeed = -0.2;
			}
			
		}
		
		this.vx += windSpeed;
		
	}
	
};

//////////////////////////////
// SETUP
//////////////////////////////

canvas.width = gameWidth;
canvas.height = gameHeight;

//////////////////////////////
// EVENT HANDLING
//////////////////////////////

function mousedown(e) {
	
	mouseIsDown = true;
	
}

function mouseup(e) {
	
	mouseIsDown = false;
	
}

function mousemove(e) {
	
	targetX = e.pageX - document.getElementById('content').offsetLeft - 35;
	targetY = e.pageY - document.getElementById('content').offsetTop  - 35;
	
}

function keydown(e) {
	
	if (e.keyCode == 32) {
		
		spacebarDown = true;
		
		return false;
		
	}
	
}

function keyup(e) {
	
	spacebarDown = false;
	
	return false;
	
}

canvas.addEventListener('mousedown', mousedown, false);
canvas.addEventListener('mouseup', mouseup, false);
document.body.addEventListener('mousemove', mousemove, false);
document.body.addEventListener('keydown', keydown, false);
document.body.addEventListener('keyup', keyup, false);

//////////////////////////////
// CONTROL FUNCTIONS
//////////////////////////////

function bg() {
	
	c.fillStyle = gameBG;
	c.fillRect(0,0,gameWidth,gameHeight);
	
}

function addBall() {
	
	if (fms == nextBallAt) {
		
		var x = randInt(70, gameWidth - 70);
		var y = randInt(-bufferZone, -70);
		
		var dx = randInt(originX - 50, originX + 50) - x;
		var dy = randInt(originY - 50, originY + 50) - y;
		
		var length = Math.sqrt(dx*dx + dy*dy);
		
		var r = randInt(1,4);
		
		var vx = (dx / length)*r;
		var vy = (dy / length)*r;
		
		balls.push(new Ball(x,y,randInt(15,70),vx,vy,ballStroke,ballFill));
		
		nextBallAt = fms + randInt(nextBallInterval - (nextBallInterval / 2), nextBallInterval + (nextBallInterval / 2));
		
	}
	
}

function addBullet() {
	
	var shotFired = false;
	
	if (mouseIsDown || spacebarDown) {
		
		if (!nextBulletAt || fms == nextBulletAt) {
			
			var dx = targetX - originX;
			var dy = targetY - originY;
			
			var length = Math.sqrt(dx*dx + dy*dy);
			
			var x = (dx / length)*10;
			var y = (dy / length)*10;
			
			if (spacebarDown) {
				
				if (ammo > ammoUnit * 50) {
				
					bullets.push(new Ball(originX,originY,10,x,y,bulletStroke, bulletFill));
					shotFired = true;
					
				}

				
			} else {
				
				bullets.push(new Ball(originX,originY,4,x,y,bulletStroke, bulletFill));
				shotFired = true;
				
			}
			
			totalBullets++;
			
			if  (ammo === 0) {
				
				nextBulletAt = fms + nextBulletIntervalEmpty;
				
			} else {
				
				nextBulletAt = fms + nextBulletInterval;
				
			}
			
		}
		
		// decrease ammo
		
		if (shotFired && spacebarDown) {
			
			ammo -= ammoUnit * 50;
			spacebarDown = false;
			
		} else if (!spacebarDown) {
			
			ammo -= ammoUnit;
			
		}
			
		if (ammo < 0) { ammo = 0; }
		
	} else {
		
		nextBulletAt = false;
		
		// increase ammo
		ammo += ammoUnit;
		
		if (ammo > gameWidth) { ammo = gameWidth; }
		
	}
	
}

function drawBalls() {
	
	for (var i = 0; i < balls.length; i++) {
		
		balls[i].move();
		
		balls[i].vy += 0.01;
		
		balls[i].draw();
		
	}
	
}

function drawScene() {
	
	c.fillStyle = '#3e2d1e';
	c.strokeStyle = 'black';
	c.lineWidth = 10;
	
	c.save();
	c.scale(1,0.2);
	
	c.beginPath();
	c.arc(gameWidth/2,2500,400,Math.PI,0,false);
	c.closePath();
	c.fill();
	c.stroke();
	
	c.restore();
	
	c.lineWidth = 1;
	c.fillStyle = '#444';
	
	c.beginPath();
	c.moveTo(gameWidth/2 - 50, gameHeight - 40);
	c.bezierCurveTo(gameWidth/2 - 50, gameHeight - 100, gameWidth/2 + 50, gameHeight - 100, gameWidth/2 + 50, gameHeight - 40);
	c.quadraticCurveTo(gameWidth/2, gameHeight - 20, gameWidth/2 - 50, gameHeight - 40);
	c.fill();
	c.stroke();
	
	c.fillStyle = 'black';
	
	c.beginPath();
	c.moveTo(gameWidth/2 - 15, gameHeight - 85);
	c.quadraticCurveTo(gameWidth/2,gameHeight - 70, gameWidth/2 + 15, gameHeight-85);
	c.fill();
	
}

function drawBullets() {
	
	for (var i = 0; i < bullets.length; i++) {
		
		bullets[i].move();
		
		bullets[i].wind();
		
		bullets[i].draw();
		
	}
	
}

function drawAmmo() {
	
	c.fillStyle = '#1a1a1a';
	c.strokeStyle = '#555';
	c.lineWidth = 0.5;
	c.fillRect(0,gameHeight-10,ammo,10);
	c.strokeRect(0,gameHeight-10,ammo,10);
		
}

function drawScore() {
	
	c.fillStyle = 'white';
	c.font = '12px Consolas';
	
	var tB = totalBullets? totalBullets : 1;
	
	c.fillText(Math.ceil(((new Date().getTime()) - timeStart) * (totalBalls / tB)),5,17);	
			
	
}

function outOfBounds() {
	
	for (var i = 0; i < balls.length; i++) {
		
		if (balls[i].x + balls[i].ra < 0 || balls[i].x - balls[i].ra > gameWidth || balls[i].y + balls[i].ra < -bufferZone || balls[i].y - balls[i].ra > gameWidth) {
			
			balls.splice(i,1);
			totalBalls++;
			
		}
		
	}
	
	for (var j = 0; j < bullets.length; j++) {
		
		if (bullets[j].x + bullets[j].ra < 0 || bullets[j].x - bullets[j].ra > gameWidth || bullets[j].y + bullets[j].ra < 0 || bullets[j].y - bullets[j].ra > gameWidth) {
			
			bullets.splice(j,1);
			
		}
		
	}
	
}


function collide(b1,b2) {
	
	var mult = 1;
	
	if (b2.ra == 10) {
		mult = 5;
	}
	
	var nx = b1.x-b1.vx - b2.x;
	var ny = b1.y-b1.vy - b2.y;
	
	if (Math.sqrt(nx*nx + ny*ny) > b1.ra + b2.ra + 5) { return; }
	
	nx /= Math.sqrt(nx*nx + ny*ny);
	ny /= Math.sqrt(nx*nx + ny*ny);
	
	var a1 = b1.vx * nx + b1.vy * ny;
	var a2 = b2.vx * nx + b2.vy * ny;
	
	var impulse = (2.0 * (a1 - a2)) / (b1.ra*5 + b2.ra*mult);
	
	b1.vx = b1.vx - impulse * b2.ra * nx*mult;
	b1.vy = b1.vy - impulse * b2.ra * ny*mult;
	
	b2.vx = -(b2.vx - impulse * b1.ra * nx);
	b2.vy = -(b2.vy - impulse * b1.ra * ny);
	
	b2.move();
		
}

function testEndGame() {
	
	var x = gameWidth / 2;
	var y = gameHeight - 35;
	var r1 = 50;
	
	for (var i = 0; i < balls.length; i++) {
		
		var dx = balls[i].x - x;
		var dy = balls[i].y - y;
		var r = balls[i].ra + r1;
		
		if (balls[i].y > gameHeight - 60) { continue; }
		
		if ((dx*dx + dy*dy) < r*r) {
			return true;
		}
		
	}
	
}

function updateScoreChart() {
	
	highScores.sort(function(a, b){ return (b-a); });
	
	var elem = $('highscores');
	
	if (elem.hasChildNodes()) {
	    
		while (elem.childNodes.length >= 1) {
	    
		    elem.removeChild(elem.firstChild);       
	    
		}
		 
	}
	
	for (var i = 0; i < highScores.length && i < 5; i++) {
		
		var li = document.createElement('li');
		li.innerHTML = highScores[i];
		
		elem.appendChild(li);
		
	}
	
	if (highScores.length === 0) {
		
		var li = document.createElement('li');
		li.innerHTML = 'No high scores yet.';
		elem.appendChild(li);
		
	}
	
}

function saveHighScore(score) {
	
	highScores.push(score);
	
	if (window.localStorage) {
		
		window.localStorage.setItem('high_scores', highScores.join(','));
		
	}
	
	updateScoreChart();
	
}

function endGame() {
	
	$('score').style.display = 'block';
	
	var time = (new Date().getTime()) - timeStart;
	
	$('time').innerHTML = Math.floor(time/1000);
	$('numballs').innerHTML = totalBalls;
	$('numbullets').innerHTML = totalBullets;
	
	totalBullets = totalBullets? totalBullets : 1;
	
	var score = Math.ceil(time * (totalBalls / totalBullets));
	
	$('final').innerHTML = Math.ceil(time * (totalBalls / totalBullets));
	
	saveHighScore(score);
	
}

//////////////////////////////
// GAME LOOPS
//////////////////////////////

function main() {
	
	fms++;
	
	nextBallInterval -= 0.01;
			
	if (nextBallInterval < 30) { nextBallInterval = 30 }
	
	bg();
	
	addBall();
	
	addBullet();
	
	drawBalls();
	
	drawScene();
	
	drawBullets();
	
	drawAmmo();
	
	// collisions between balls and bullets
	for (var i = 0; i < balls.length; i++) {
		
		for (var j = 0; j < bullets.length; j++) {
			
			collide(balls[i], bullets[j]);
			
		}
		
	}
	
	// collisions between enemy balls
	for (i = 0; i < balls.length; i++) {
		
		for (j = i + 1; j < balls.length; j++) {
			
			collide(balls[i], balls[j]);
			
		}
		
	}
	
	if (testEndGame()) {
		
		endGame();
		
		return;
		
	}
	
	outOfBounds();
	
	drawScore();
	
	setTimeout(main, 30);
	
}

//////////////////////////////
// INIT
//////////////////////////////

updateScoreChart();

bg();
	
drawScene();

drawAmmo();

$('inner').style.opacity = 1;

$('start').onclick = function() {
	
	$('inner').style.display = 'none';
	
	main();

};

$('restart').onclick = function() {
	
	balls = [];
	bullets = [];
	
	fms = 0;
	
	nextBallInterval = 90;
	nextBallAt = 30;
	
	nextBulletInterval = 3;
	nextBulletIntervalEmpty = 9;
	nextBulletAt = false;
	
	ammo = gameWidth;
	timeStart = (new Date()).getTime();
	totalBalls = 0;
	totalBullets = 0;
	
	$('score').style.display = 'none';
	
	main();
	
};