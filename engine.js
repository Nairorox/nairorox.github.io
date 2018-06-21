/*		CREDITS			*/

//Created and coded by: Damian Nowakowski
//https://github.com/Nairorox/

//	Sprites Used:
//	main character:
//	https://devilsworkshop.itch.io/platformer-free-2d-sprites-game-art-and-ui
//	chapter 1:
//	https://raventale.itch.io/parallax-background
//	chapters 1+
//	https://free-game-assets.itch.io/free-horizontal-game-backgrounds


class Game{
	constructor(){
		this.players = [];
		this.chapters = [];
		this.interval = 0;
		this.currentChapter = 0;
		this.running = false;
		this.frame = 0;
		this.gOAT= 50
		this.gOATD = 'down';
		this.over = false;
		this.won = false;
	}
	
	start(){
		this.reset();
		this.running = true;
		this.interval = setInterval(() => {
			this.loop();
		}, 1000/60);
		this.chapters[this.currentChapter].start();
	}

	reset(){
		this.running = false;
		clearInterval(this.interval);
		this.refresh();
	}

	loop(){	//represents one frame
		if(this.running){
			this.refresh();
			this.draw();
			this.update();
			this.frame += 1;
		}
	}
	refresh(){
		ctx.clearRect(0, 0, gameDOM.width, gameDOM.height);
	}

	draw(){
		this.chapters[this.currentChapter].draw();
		this.players.forEach(player => {
			player.draw();
		});
		if(this.over) {
			this.determineAndDisplayScreen();
		}
	}

	determineAndDisplayScreen(){
		if(this.won){
			this.displayWinScreen();
		}
		else{
			this.displayLoseScreen();
		}
	}
	
	update(){
		this.players.forEach(player => {
			player.update();
		});
		pc.lastX = pc.realX;
	}

	clearAllLayers(){
		this.chapters[this.currentChapter].layers.forEach(layer => {
			layer.clear();
		});
	}

	goToNextChapter(){
		pc.reset();
		this.clearAllLayers();
		if(this.currentChapter >= this.chapters.length - 2){
			this.currentChapter += 1;
			this.chapters[this.currentChapter].start();
			this.win();
		}
		else{
			this.currentChapter += 1;
			this.chapters[this.currentChapter].start();
		}
	}

	addPlayer(player){
		player ? this.players.push(player) : null;
		document.addEventListener('keydown', (e) => {
			player.pressHandler(e);
		});
		document.addEventListener('keyup', (e) => {
			player.releaseHandler(e);
		});
	}

	lose(){
		this.over = true;
		this.won = false;
		this.players.forEach(player => {
			player.die();
		});
	}
	win(){
		this.over = true;
		this.won = true;
	}

	displayLoseScreen(){
		ctx.drawImage(sprite['gameOver'], gameDOM.width/2-192.5, this.gOAT);
		if(this.gOAT > 150){
			this.gOATD = 'up'
		}
		else if(this.gOAT < 50){
			this.gOATD = 'down';
		}
		this.gOAT += this.gOATD == 'down' ? 3 : -3;
	}

	displayWinScreen(){
			ctx.fillStyle = "#FFFFFF"
			ctx.fillRect(0, 0, gameDOM.width, gameDOM.height);
			ctx.fillStyle = "#000000"
			ctx.font = "120px arial"
			ctx.fillText(`You've won!`, 140, 120)
			ctx.font = "60px arial"
			ctx.fillText(`Thanks for playing this little demo`, 0, 320)
	}


	addChapter(chapter){
		this.chapters.push(chapter);
	}

	loadChapter(index){
		pc.reset();
		game.refresh();
		this.currentChapter = index;
	}
}

class Player{
	constructor(controls, game = null, x = 100, y = 275, r = 10, w = 120, h = 110){
		this.x = x;
		this.y = y;
		this.r = r;
		this.w = w;
		this.h = h
		this.realX = x;
		this.rightOffset = w/7;
		this.leftOffset = -w/5
		this.upOffset = -h/5
		this.downOffset = h/2.1
		this.movingLeft = false;
		this.movingRight = false;
		this.blockedByWall = [];
		this.horCollisions = {};
		this.inJump = false;
		this.jumpTick = 30;
		this.jumpDirection = 1;
		this.standingAt = ''
		this.falling = true;
		this.dead = false;
		this.debugDrawOn = false;
		for(let control in controls){
			this[control] = controls[control].toLowerCase();
		}
		if(game){
			game.addPlayer(this);
		}
	}

	pressHandler(e){
		let key = e.key.toLowerCase()
		if(key === this.left){
			this.movingLeft = true;
		}

		if(key === this.right){
			this.movingRight = true;
		}

		if(e.code.toLowerCase() === this.jumpkey && !this.inJump){
			this.jumpStart();
		}
	}

	jumpStart(){
		if(!this.falling && !this.inJump){
			this.inJump = true;
			if(this.standingAt){
				this.resetStandingAt();
			}
		}
	}

	resetStandingAt(){
		this.standingAt.xSpeed = this.standingAt.initX;
		this.standingAt = null;
	}

	releaseHandler(e){
		let key = e.key.toLowerCase();
		if(key === this.left){
			this.movingLeft = false;
		}

		if(key === this.right){
			this.movingRight = false;
		}
	}

	draw(){
		pctx.clearRect(0, 0, gameDOM.width, gameDOM.height);
		this.determineAndDisplayPlayerSprite();
		//debug
		if(this.debugDrawOn){
			this.debugDraw();
		}
		pctx.stroke();
	}

	determineAndDisplayPlayerSprite(){
		if(this.dead){
			pctx.drawImage(sprite[`dead${game.frame%18+1}`], this.x - this.w/2, this.y - this.h/2, this.w, this.h)
		}
		else if(this.inJump){
			this.drawJump();
		}
		else if(this.movingLeft){
			pctx.drawImage(sprite[`runl${game.frame%8+1}`], this.x - this.w/2, this.y-this.h/2, this.w, this.h)
		}
		else if(this.movingRight){
			pctx.drawImage(sprite[`run${game.frame%8+1}`], this.x - this.w/2, this.y-this.h/2, this.w, this.h)
		}
		else{
			pctx.drawImage(sprite[`idle${game.frame%8+1}`], this.x - this.w/2, this.y-this.h/2, this.w, this.h)
		}
	}

	drawJump(){
		let curFrame = this.jumpTick%3+1;
		if(this.jumpDirection == -1 && this.jumpTick <= 33){
			curFrame += 5
		}
		else if(this.jumpTick >= 33){
			curFrame = this.jumpTick%2+5
		}
		pctx.drawImage(sprite[`jump${curFrame}`], this.x - this.w/2, this.y - this.h/2, this.w, this.h)
	}

		debugDraw(){
			pctx.beginPath();
			pctx.arc(this.x,this.y,this.r,0,2*Math.PI);
			pctx.moveTo(this.x,0);
			pctx.lineTo(this.x,gameDOM.width);
			pctx.moveTo(this.x + this.leftOffset,0);
			pctx.lineTo(this.x + this.leftOffset,gameDOM.height);
			pctx.moveTo(this.x + this.rightOffset,0);
			pctx.lineTo(this.x + this.rightOffset,gameDOM.height);
			pctx.moveTo(0, this.y + this.upOffset);
			pctx.lineTo(gameDOM.width, this.y + this.upOffset);
			pctx.moveTo(0,this.y + this.downOffset);
			pctx.lineTo(gameDOM.width,this.y + this.downOffset);
	}

	update(){
		this.moveHr()
		this.verProcess();
		this.fellBelowHandler();
		this.fallingHandler();
	}

	moveHr(){
		this.falling = true;
		this.horCollisions = this.checkHorizontalCollisions();
		this.moveAllWalls(this.determineDirection());
	}

	determineDirection(){
		if(this.movingLeft && this.horCollisions.lgood ){
			return 1;
		}
		else if(this.movingRight && this.horCollisions.rgood){
			return -1;
		}
		else{
			return 0;
		}
	}

	moveAllWalls(direction){
		for(let i = 0; i < game.chapters[game.currentChapter].walls.length; i++){
			let wall = game.chapters[game.currentChapter].walls[i];
			wall.x += gameSpeed * direction;
			if(i == 0){
				this.increaseRealXBy(gameSpeed * direction * -1)
			}
		}
	}

	increaseRealXBy(value){
		this.realX += value;
	}

	verProcess(){
		if(this.falling && !this.inJump){
			this.y += gameSpeed;
		}
		else if(this.inJump){
			this.jumpHandler();
		}
		this.platformMovement();
	}

	jumpHandler(){
		this.jumpTick += 1 * this.jumpDirection;
		if(this.jumpTick >= 50){
			if(this.jumpDirection == 1){
				this.jumpDirection = -1;
			}
		}
		else if(this.jumpTick <= 30 && this.jumpDirection == -1){
			this.finishJump();
			return;
		}
		this.y -= ((this.jumpTick / 30) * this.jumpDirection * gameSpeed);
	}

	finishJump(){
		this.inJump = false;
		this.jumpTick = 30;
		this.jumpDirection = 1;
	}

	platformMovement(){
		game.chapters[game.currentChapter].colObjects.forEach(wall => {
				if(this.y + this.downOffset >= wall.y && this.y < wall.y + wall.height && this.x + this.rightOffset > wall.x && this.x + this.leftOffset < wall.x + wall.width){
					this.placePlayerAboveWall(wall);
					this.drivingOnWall(wall);
					this.standingAt = wall;
					this.falling = false;
				}
				this.preventOverjumping(wall);
		});
	}

	drivingOnWall(wall){
		if(this.standingAt){
			this.standingAt.xSpeed = 0;
			this.realX += wall.initX;
			wall.realX += wall.initX;
			this.playerOnMovingPlatformBlockedBy(wall);
		}		
	}

	playerOnMovingPlatformBlockedBy(wall){
		if(this.standingAt != wall || (this.blockedByWall.length > 0 && !this.inJump)){
			this.resetStandingAt();
		}
	}

	placePlayerAboveWall(wall){
		this.y = wall.y - this.downOffset;
	}


	preventOverjumping(wall){
		if(this.y + this.upOffset <= wall.y + wall.height && this.y > wall.y && this.x + this.rightOffset > wall.x && this.x + this.leftOffset < wall.x + wall.width){
			this.finishJump();
		}
	}

	fallingHandler(){
		if(this.falling && this.standingAt && !this.inJump){
			this.resetStandingAt();
		}
	}

	checkHorizontalCollisions(){
		this.blockedByWall = [];
		let lgood = true;
		let rgood = true;
		for(let i = 0; i < game.chapters[game.currentChapter].colObjects.length; i++){
				let wall = game.chapters[game.currentChapter].colObjects[i];
				if ((this.x + this.leftOffset - gameSpeed - 5 < wall.x + wall.width && this.x > wall.x && this.y + this.downOffset/1.2 > wall.y && this.y + this.upOffset*1.2 < wall.y + wall.height)){
					lgood = false;
					this.blockedByWall.push(wall);
				}
				else if (this.x + this.rightOffset + gameSpeed + 5 > wall.x && this.x < wall.x + wall.width && this.y + this.downOffset/1.2 > wall.y && this.y + this.upOffset*1.2 < wall.y + wall.height) {
					rgood = false;
					if(wall.moving){
						if(!rgood && !lgood){	//die scenario
							game.lose();
						}
					}
					this.blockedByWall.push(wall);
				}
			}

			this.collisionEvents();
			return {lgood, rgood}
	}

	collisionEvents(){
		this.blockedByWall.forEach(wall => {
			wall.collisionEvent();
		});
		if(this.standingAt){
			this.standingAt.collisionEvent();
		}
	}

	fellBelowHandler(){
		if(this.checkIfFellBelow() && !game.over){
			game.lose();
		}
	}

	checkIfFellBelow(){
		if(pc.y > gameDOM.height){
			return true;
		}
	}

	die(){
		this.dead = true;
	}

	reset(){
		this.standingAt = null;
		this.realX = 500;
		this.y = 275;
	}
}

class Chapter{
	constructor(game){
		this.layers = [];
		this.walls = [];
		this.killingWalls = [];
		this.winningWalls = [];
		this.obstacles = [];
		this.allObjects = [];
		this.colObjects = [];
		this.movingObjects = [];
		this.parent = game;
		game.chapters.push(this);
	}

	start(){
		if(this.runAtStart){
			this.runAtStart();
		}
	}

	addWall(wall){
		this.walls.push(wall);
		this.allObjects.push(wall);
		if(wall.moving){
			this.movingObjects.push(wall);
		}
	}

	setRunAtStart(func){
		this.runAtStart = func;
	}

	draw(){
		this.colObjects = [];
		this.layers.forEach(layer => {
			layer.draw();
		});
		this.walls.forEach(wall => {
			if(wall.x + wall.width >= 0 && wall.x <= gameDOM.width){
				this.colObjects.push(wall);
				wall.colObject = true;	
				wall.draw();
			}
			else{
				wall.colObject = false;
			}
			wall.processMovement();
		});
	}
}


class Wall{	//chapter
	constructor(x, y, width, height, chapter, fill, color = '#000000', moving = false, xSpeed = 0, display = true, autoAdd = true, stopAt = 0){
		this.x = x;
		this.realX = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.chapter = chapter;
		this.fill = fill;
		this.color = color;
		this.moving = moving;
		this.xSpeed = xSpeed;
		this.initX = xSpeed || 0;
		this.stopAt = stopAt;
		this.colObject = false;
		this.display = display;
		if(autoAdd){
			chapter.addWall(this);
		}
	}

	draw(){
		if(!this.display){
			return;
		}
		if(this.fill){
			this.fillDraw();
		}
		else{
			ctx.rect(this.x, this.y, this.width, this.height);
		}
		ctx.stroke();
	}

	fillDraw(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = '#000000';
	}

	
	processMovement(){
		let layersAlreadyPushed = false;
			this.checkMovingWallStop();
			this.x += this.xSpeed;
			this.realX += this.xSpeed;
			let wallPushing = this.pushedByWall();
			this.checkIfCrushngPlayer();
			this.updateWallsAndLayers(wallPushing);
	}

	checkMovingWallStop(){
		if(this.stopAt != 0 && (this.xSpeed > 0 && this.realX >= this.stopAt) || (this.xSpeed < 0 && this.realX <= this.stopAt)){
			this.xSpeed = 0;
			this.initX = 0;
		}
	}

	pushedByWall(){
		let wallPushing = false;
		if(pc.blockedByWall.length > 0){
				pc.blockedByWall.forEach(blockingWall =>{	//pushing player 
					if(blockingWall === this && this.moving && ((this.x > pc.x && this.xSpeed <= 0) || (this.x < pc.x && this.xSpeed >= 0))){
						game.chapters[game.currentChapter].walls.forEach(wall => {
							wall.x += -blockingWall.xSpeed;
						});
						wallPushing = true;
					}
				});
				if(wallPushing){	//layers after pushing
					game.chapters[game.currentChapter].layers.forEach(layer =>{
					layer.x += -this.xSpeed*layer.speed;
				});
			}
		}
		return wallPushing;
	}

	checkIfCrushngPlayer(){
		if(pc.blockedByWall.length > 1){
			pc.blockedByWall.forEach(blck =>{
				if(blck.moving && (blck.xSpeed < 0 && pc.x < blck.x) || (blck.xSpeed > 0 && pc.x > blck.x)){
					game.lose();
				}
			});
		}
	}

	updateWallsAndLayers(wallPushing){
		if(pc.standingAt === this && this.moving){
			game.chapters[game.currentChapter].walls.forEach(wall => {
				if(wall !== this && pc.blockedByWall.length < 1){
					wall.x += -this.initX;
				}
			});
			if(!pc.blockedByWall.length > 0 && !wallPushing &&  pc.standingAt){	//layers - driving on wall
				this.chapter.layers.forEach(layer => {
					layer.x += this.xSpeed > 0 ? -layer.speed*pc.standingAt.initX : -layer.speed*pc.standingAt.initX; 
				});
			}
		}
	}

	collisionEvent(){
		return null;
	}

	stop(){
		this.xSpeed = 0;
	}

	updateSpeed(n){
		this.xSpeed = n;
		this.initX = n;
	}

}

class KillingWall extends Wall{
	constructor(x, y, width, height, chapter, fill, color = '#000000', moving = false, xSpeed = 0, display = true, autoAdd = true, stopAt = 0){
		super(x, y, width, height, chapter, fill, color, moving, xSpeed, display, autoAdd, stopAt);
		chapter.killingWalls.push(this);
	}

	collisionEvent(){
		game.lose();
		this.stop();
	}
}

class WinWall extends Wall{
	constructor(x, y, width, height, chapter, fill, color = '#000000', moving = false, xSpeed = 0, display = true, autoAdd = true, stopAt = 0){
		super(x, y, width, height, chapter, fill, color, moving, xSpeed, display, autoAdd, stopAt);
		chapter.winningWalls.push(this);
	}

	collisionEvent(){
		game.goToNextChapter();
		this.stop();
	}
}


/*	layers for bg sprites	*/
let layerId = 0;
class Layer{
	constructor(x, y, width, src, canvas = gameDOM, chapter = chapter1, speed, autoMove = 0){
		this.x = x;
		this.y = y;
		this.src = src;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.bg = sprite[`l${layerId}`] = new Image;
		this.bg.src = src;
		this.speed = speed;
		this.width = width || canvas.width;
		this.autoMove = autoMove;

		chapter.layers.push(this);
		layerId += 1;
	}

	draw(){
		this.clear();
		this.ctx.drawImage(this.bg, this.x, this.y, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.bg, this.x-1000, this.y, this.canvas.width, this.canvas.height);
		this.ctx.drawImage(this.bg, this.x+1000, this.y, this.canvas.width, this.canvas.height);
		if(this.x < -1000 || this.x > 1000){
			this.x = 0;
		}
		let good = this.getAllowedMoves;
		if(pc.movingLeft && good.l){
			this.x += this.speed*gameSpeed;
		}
		else if(pc.movingRight && good.r){
			this.x -= this.speed*gameSpeed;
		}
		if(this.autoMove){
			this.x += this.autoMove*gameSpeed;
		}
	}

	get getAllowedMoves(){
		let l = true;
		let r = true;
		pc.blockedByWall.forEach(blck => {
			if(blck.x < pc.x){
				l = false;
			}
			if(blck.x > pc.x){
				r= false;
			}
		});
		return {l, r};
	}

	clear(){
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
	}
}

const game = new Game;
const pc = new Player({left: 'a', right: 'd', jumpkey:'space'}, game, gameDOM.width/2, 245);