
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function respawn(team){
    if(team ==="red"){
        return {
            x:Math.random() * 700,
            y:Math.random() * 700
        }
    } else {
        return {
            x:(Math.random() * 700) + 700,
            y:Math.random() * 700
        }
    }
}

function friendlyCollision(self, ent){
    var temp = { x: self.velocity.x, y: self.velocity.y };
    var dist = distance(self, ent);
    var delta = self.radius + ent.radius - dist;
    var difX = (self.x - ent.x)/dist;
    var difY = (self.y - ent.y)/dist;

    self.x += difX * delta / 2;
    self.y += difY * delta / 2;
    ent.x -= difX * delta / 2;
    ent.y -= difY * delta / 2;

    self.velocity.x = ent.velocity.x * friction;
    self.velocity.y = ent.velocity.y * friction;
    ent.velocity.x = temp.x * friction;
    ent.velocity.y = temp.y * friction;
    self.x += self.velocity.x * self.game.clockTick;
    self.y += self.velocity.y * self.game.clockTick;
    ent.x += ent.velocity.x * self.game.clockTick;
    ent.y += ent.velocity.y * self.game.clockTick;
}

var moveTowardPoint = function(self, end){
    var dist = distance(self, end);
    var difX = (end.x - self.x)/dist;
    var difY = (end.y - self.y)/dist;
    var gravx = difX * acceleration;
    var gravy = difY * acceleration;
    self.velocity.x += gravx;
    self.velocity.y += gravy;
}

var collide = function (self, other) {
    return distance(self, other) < self.radius + other.radius;
};

var visualCollide = function(self, other) {
    return distance(self, other) < self.visualRadius + other.radius;
}

var attackerCollision = function(self, other){
    if((self.team === "red" && collideRightCenter(self)) || (self.team === "blue" && collideLeftCenter(self))){
        var spawn = respawn(self.team);
        self.x = spawn.x;
        self.y = spawn.y;
        if(self.hasFlag){
            self.hasFlag = false;
            self.team==="red"?self.game.blueTeam.flag.reset():self.game.redTeam.flag.reset();
        }
    } else {
        var spawn = respawn(other.team);
        other.x = spawn.x;
        other.y = spawn.y;
        if(other.hasFlag){
            other.hasFlag = false;
            other.team==="red"?other.game.blueTeam.flag.reset():other.game.redTeam.flag.reset();
        }
    }
}

var collideLeft = function (self) {
    return (self.x - self.radius) < 0;
};

var collideRightCenter = function (self) {
    return (self.x + self.radius) > 700;
};

var collideLeftCenter = function (self) {
    return (self.x - self.radius) < 700;
};

var collideRight = function (self) {
    return (self.x + self.radius) > 1400;
};

var collideTop = function (self) {
    return (self.y - self.radius) < 0;
};

var collideBottom = function (self) {
    return (self.y + self.radius) > 700;
};

function Flag(game, team){
    this.team = team;
    this.radius = 10;
    this.game = game;
    this.captured = false;
    if(team === "red"){
        this.x = 45;
        this.y = 350;
        this.home = {x:45, y:350};
        //Entity.call(game, 45, 350);
    } else {
        this.x = 1350;
        this.y = 350;
        this.home = {x:1350, y:350};
        //Entity.call(game, 1350, 350);
    }
}

Flag.prototype.update = function() {

};

Flag.prototype.draw = function(ctx){
    if(!this.captured){
        ctx.beginPath();
        ctx.fillStyle = "Green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
}

Flag.prototype.reset = function(){
    this.x = this.home.x;
    this.y = this.home.y;
    this.captured = false;
}

function Attacker(game, team){
    this.team = team;
    this.game = game;
    this.hasFlag = false;
    var spawn = respawn(team);
    this.velocity = { x:0, y:0 };
    this.visualRadius = 700;
    this.radius = 15;
    this.x = spawn.x;
    this.y = spawn.y;
}

Attacker.prototype.update = function(){ 
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if(this.x>1400) this.x = 1400 - this.radius;
    else if(this.x<0) this.x = 0+this.radius;
    if(this.y>1400) this.y = 1400-this.radius;
    else if(this.y<0) this.y = 0+this.radius;

    var end = {x:this.game.redTeam.flag.x, y:this.game.redTeam.flag.y};
    if((this.team === "red" && !this.hasFlag) || (this.team === "blue" && this.hasFlag)){
        end = {x:this.game.blueTeam.flag.x, y:this.game.blueTeam.flag.y};
    }
    var start = {x:this.x, y:this.y}
    var theta = 0;
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var pi = Math.PI;
    if(dx === 0){
        this.velocity.y = dy<0?maxSpeed:-maxSpeed;
        theta = dy<0?(4*pi)/3:pi/2;
    } else if(dy === 0){
        this.velocity.x = dx>0?maxSpeed:-maxSpeed;
        theta = dx>0?pi:0;
    } else {
        theta = Math.atan(Math.abs(dy/dx));
        if(dy>0 && dx < 0) {
            theta = pi + theta;
        } else if(dy>0) {
            theta = 2*pi - theta;
        } else if(dx<0){
            theta = pi-theta;
        }
        this.velocity.x = maxSpeed*Math.cos(theta);
        this.velocity.y = -maxSpeed*Math.sin(theta);
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if(ent != this && collide(this, ent)){
            if(ent.team !== this.team){
                if(ent instanceof Flag && !ent.captured){
                    this.hasFlag = true;
                    //captured opposite team's flag
                    ent.team==="red"?this.game.redTeam.flag.captured = true:this.game.blueTeam.flag.captured = true;
                } else if(ent instanceof Attacker) {
                    attackerCollision(this, ent);
                }
            } else {
                if(ent instanceof Flag && this.hasFlag){
                    this.hasFlag = false;
                    this.team==="red"?this.game.blueTeam.flag.reset():this.game.redTeam.flag.reset();
                    var score = document.getElementById(this.team);
                    score.innerHTML = Number(score.innerHTML) + 1;
                }
            }
        }
        if( ent!=this && !(ent instanceof Flag) && visualCollide(this, ent)) {
            var dist = distance(this, ent);
            var difX = (ent.x - this.x)/dist;
            var difY = (ent.y - this.y)/dist;
            var gravx = difX * acceleration / (dist*dist);
            var gravy = difY * acceleration / (dist*dist);
            if(ent.team != this.team && this.safe() && !ent.safe()){
                if(ent instanceof Defender) {
                    gravx *= 2;
                    gravy *= 2;
                }
                this.velocity.x += gravx;
                this.velocity.y += gravy;
            } else {
                this.velocity.x -= gravx;
                this.velocity.y -= gravy;
            }
            
        }
    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }


    if(this.hasFlag){
        if(this.team==="red"){
            this.game.blueTeam.flag.x = this.x;
            this.game.blueTeam.flag.y = this.y;
        } else {
            this.game.redTeam.flag.x = this.x;
            this.game.redTeam.flag.y = this.y;
        }
    }
};

Attacker.prototype.draw = function(ctx) {
    ctx.beginPath();
    if(this.team === "red"){
        ctx.fillStyle = "Orange";
    } else {
        ctx.fillStyle = "Purple";
    }
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    if(this.hasFlag){
        ctx.beginPath();
        ctx.fillStyle = "Green";
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
};

Attacker.prototype.safe = function(){
    if(this.team==="red"){
        return this.x + this.radius<700;
    } else {
        return this.x-this.radius>700;
    }
}

function Defender(game, team){
    this.team = team;
    this.game = game;
    var spawn = respawn(team);
    this.velocity = { x:0, y:0 };
    this.visualRadius = 700;
    this.radius = 15;
    this.x = spawn.x;
    this.y = spawn.y;
}

Defender.prototype.update = function(){ 
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;


    var min = this.team==="red"?0+this.radius:700+this.radius;
    var max = this.team==="red"?700-this.radius:1400-this.radius;
    if(this.x>max) this.x = max;
    else if(this.x<min) this.x = min;
    if(this.y>700-this.radius) this.y = 700 - this.radius;
    else if(this.y<0+this.radius) this.y  = this.radius;

    var enemiesVisible = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if(ent != this && collide(this, ent)){
            if(ent.team !== this.team && ent instanceof Attacker){
                var spawn = respawn(ent.team);
                ent.x = spawn.x;
                ent.y = spawn.y;
                if(ent.hasFlag){
                    ent.hasFlag = false;
                    ent.team==="red"?ent.game.blueTeam.flag.reset():ent.game.redTeam.flag.reset();
                }
            } else if(!(ent instanceof Flag)){
                friendlyCollision(this, ent);
            } 
        }
        if( ent!=this && !(ent instanceof Flag || ent instanceof Defender) 
        && ent.team != this.team && !ent.safe() && visualCollide(this, ent)) {
            var dist = distance(this, ent);
            var difX = (ent.x - this.x)/dist;
            var difY = (ent.y - this.y)/dist;
            var gravx = difX * acceleration / (dist*dist);
            var gravy = difY * acceleration / (dist*dist);
            this.velocity.x += gravx;
            this.velocity.y += gravy;
            enemiesVisible = true;
        }
    }

    if(!enemiesVisible){
        this.velocity.x = this.velocity.x/1.5;
        this.velocity.y = this.velocity.y/1.5;
    }
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeedDefender) {
        var ratio = maxSpeedDefender / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Defender.prototype.draw = function(ctx) {
    ctx.beginPath();
    if(this.team === "red"){
        ctx.fillStyle = "Yellow";
    } else {
        ctx.fillStyle = "Pink";
    }
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

};

Defender.prototype.safe = function(){
    if(this.team==="red"){
        return this.x + this.radius<700;
    } else {
        return this.x-this.radius>700;
    }
}






// the "main" code begins here
var friction = 1;
var acceleration = 200000;
var maxSpeed = 250;
var maxSpeedDefender = 225;

var ASSET_MANAGER = new AssetManager();

// ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    // console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    for(var i = 0; i<7; i++){
        gameEngine.addEntity(new Attacker(gameEngine, "red"));
    }
    for(var i = 0; i<7; i++){
        gameEngine.addEntity(new Attacker(gameEngine, "blue"));
    }
    for(var i = 0; i<3; i++){
        gameEngine.addEntity(new Defender(gameEngine, "red"));
    }
    for(var i = 0; i<3; i++){
        gameEngine.addEntity(new Defender(gameEngine, "blue"));
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
