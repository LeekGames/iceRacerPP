/*global Phaser*/

var game = new Phaser.Game(964, 536, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update }, true, false);
    
function preload()
{
    game.load.image('canyon', 'assets/canyon.png');
    game.load.image('vessel', 'assets/vessel-snowy.png');
    game.load.image('barrier-big', 'assets/barrier-big.png');
    game.load.image("barrier-small", "assets/barrier-small.png");
	game.load.spritesheet('vessel', 'assets/spritesheets/vessel.png', 112, 120, 4);
	game.load.spritesheet('vesselExplode', 'assets/spritesheets/vessel_explode.png', 112,120,6);
	game.load.image('restartButton', 'assets/button_restart.jpg');
	
	game.load.image('mute', 'assets/mute.png');
	game.load.image('sound', 'assets/sound.png');

    game.load.audio('music', "assets/music.wav");
    game.load.audio("msgo", "assets/gameover.wav");
}
    
var vessel;
var vesselsize;
var anim;
var canyon;
var bigbarrier;
var smallbarrier;
var barriers;
var score;
var music;
var gosound;

var goScreen;
var muteButton;
var soundMuted = false;

//Displays
var scoreboard;
var cryoDisplay;
var distanceDisplay;
function create()
{
    game.physics.startSystem(Phaser.Physics.ARCADE);

    canyon = game.add.tileSprite(0, 0, 964, 536,'canyon');
    
    score = 0;
    scoreboard = game.add.text(790, 498, "SCORE: 0", { fontSize: '32px', fill: '#4d94ff' });

	cryoDisplay = game.add.text(25, 498-5, "Cryogen: 100%", { fontSize: '16px', fill: '#4d94ff' });
	distanceDisplay = game.add.text(25, 498+16+5, "Distance: 0", { fontSize: '16px', fill: '#4d94ff' });

    vessel = game.add.sprite (160, 200, 'vessel');
	anim = vessel.animations.add('anim');		//Prep for Animation
	vessel.animations.play('anim', 5, true);	//Start of Vessel-Animation
    vessel.angle += 90;
    game.physics.arcade.enable(vessel);
    vessel.body.collideWorldBounds = true;
    vessel.body.allowGravity = false;

    barriers = game.add.group();
    barriers.enableBody = true;
    
    bigbarrier = barriers.create(2000, 200, 'barrier-big');
    bigbarrier.body.allowGravity = false;
    
    smallbarrier = barriers.create(1000, 300, "barrier-small");
    smallbarrier.body.allowGravity = false;
    
	//Create Keyboard-inputs
    space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

	esc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	game.input.keyboard.addKeyCapture([ Phaser.Keyboard.ESC]);
	
	r = game.input.keyboard.addKey(Phaser.Keyboard.R);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.R);
	
	m = game.input.keyboard.addKey(Phaser.Keyboard.M);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.M);

	f5 = game.input.keyboard.addKey(Phaser.Keyboard.F5);
	game.input.keyboard.addKeyCapture(Phaser.Keyboard.F5);
    
    cursors = game.input.keyboard.createCursorKeys();
    
	//Create Sound
    music = game.add.audio("music");
    music.play();
    music.volume = 0.2;
    gosound = game.add.audio("msgo");
    gosound.volume = 0.3;

	muteButton = game.add.button(920, 5, 'sound', muteSound, this, 2, 1, 0);	

}

//Keyboard Inputs
var cursors;
var space;
var esc;
var r;
var m;
var f5;

//others
var running = false;
var distance = 0;
var cursors;
var speed = 8;
var cryoPerc = 100;
var cryoTemp = 0;
var cryoActive=false;
var gameover = false;
var maxSize = 10;
var speedInk = 15;
var movementInk = 1;
var enableAllKeys = false;
function update()
{
	if(space.downDuration(10)) 
	{
		enableAllKeys=true;
		if(!gameover) running = true;
	}
	
    gameover = checkcollision();
    
	
	if(r.downDuration(10) && gameover) resetGame();
	if(f5.downDuration(10) && gameover) resetGame();


	if(gameover)
	{ 
		speed = 0;
		running = false;
	}
	else if(enableAllKeys)
	{
		
		if(m.downDuration(10))
		{
			muteSound();
		}
		if(esc.isDown)
		{
			running = false;
		}

		if(cursors.left.isDown && cryoPerc>0)
		{
			if(running) running=false;
			else running = true;
			cryoPerc--;
			cryoActive = true;
		}
		else if(cryoPerc == 0)
		{
			cryoActive = false;
			running = true;
		}
		
		if(cryoActive && !cursors.left.isDown)
		{
			running = true;
			cryoActive = false;
		}

		cryoTemp++;
		if(!cryoActive && cryoTemp >= 15)
		{
			cryoTemp = 0;
			if(cryoPerc != 100) 
				cryoPerc++;
		}
		cryoDisplay.text = "Cryogen: "+cryoPerc+"%";
		cryoDisplay.bringToTop();

		if(cryoPerc<20 && cryoPerc>=0)
		{
			cryoDisplay.addColor('#ff0000', 0);
		}
		else
		{
			cryoDisplay.addColor('#4d94ff', 0);
		}

		if(running)
		{
			canyon.tilePosition.x += -speed;

			distance += 1;

			bigbarrier.x += -speed;
			//console.log(bigbarrier.x);

			smallbarrier.x += -speed;
			//console.log(smallbarrier.x);

			if(bigbarrier.x < 0)
			{
				placeBarrier(true);
				score++;
			}

			if(smallbarrier.x < 0) 
			{
				placeBarrier(false);
				score++;
			}

			if(score >= maxSize){ 
				scoreboard.position.x -= 15
				maxSize *= 10;
			}

			if(score > speedInk){
				speedInk += 40;
				movementInk+=0.25;
			}
		    
			if(cursors.down.isDown && !cursors.up.isDown) vessel.body.velocity.y = (speed + 420) * movementInk; 
			else if(cursors.up.isDown && !cursors.down.isDown) vessel.body.velocity.y = -(speed + 420) * movementInk;
			else if(!cursors.up.isDown && !cursors.up.isDown) vessel.body.velocity.y = 0;

			scoreboard.text = "SCORE: " + score;
			speed += 0.005;
		}
		distanceDisplay.text = "Distance: "+distance;
	}
}

function muteSound()
{
	if(soundMuted)
	{
		music.volume = 0.2;
		gosound.volume = 0.2;
		muteButton.kill();
		muteButton = game.add.button(920, 5, 'sound', muteSound, this, 2, 1, 0);
		soundMuted = false;
	}
	else
	{
		music.volume = 0;
		gosound.volume = 0;
		muteButton.kill();
		muteButton = game.add.button(920, 5, 'mute', muteSound, this, 2, 1, 0);
		soundMuted = true;
	}
}

function checkcollision()
{
    var bighit;
    var smallhit;
    
    var vbounds = vessel.getBounds();
    var bbounds = bigbarrier.getBounds();
    var sbounds = smallbarrier.getBounds();
    
    bighit = Phaser.Rectangle.intersects(vbounds, bbounds);
    smallhit = Phaser.Rectangle.intersects(vbounds, sbounds);
    
    if(bighit || smallhit)
    {
        console.log("collision");
        endgame();
    }
    
    return (bighit || smallhit);
}

var gotxt;
var button;
var deathvessel;
async function endgame()
{
    if(!gameover)
    {
        running = false;
        gameover = true;
        vessel.body.velocity.y = 0;

		//Explosion at death
		vessel.loadTexture('vesselExplode')

		var anima = vessel.animations.add('anima');	//Prep for Animation
		vessel.animations.play('anima', 12, false);	//Start of Vessel-Animation
		vessel.position.x = vessel.position.x;
		vessel.position.y = vessel.position.y;

        gotxt = game.add.text( 137, 194, "Game Over", { fontSize: '128px', fill: '#4d94ff' })
        
		button = game.add.button(game.world.centerX - (320/2), 350, 'restartButton', resetGame, this, 2, 1, 0);

        music.stop();
        gosound.play();
        await sleep(2000);
        gosound.stop();

    }
}

function placeBarrier(big)
{
    if(big) console.log("barrier.big");
    else console.log("barrier.small");
    
    
    var y = getPlaceY(big);
    var x = getPlaceX(big);

	var distanceIncrease = speed*score;
    
    if(big) 
    {
        bigbarrier.destroy();
        bigbarrier = barriers.create(x, y, "barrier-big");
    }
    else 
    {
        smallbarrier.destroy();
        smallbarrier = barriers.create(x, y, "barrier-small")
    }
}

function getPlaceX(big)
{
    var x;
    
    if(big == true)x = canyon.tilePosition.x + smallbarrier.x;
    else x = canyon.tilePosition.x +  bigbarrier.x;
    
    var nx = canyon.tilePosition.x + getRandomInteger(vessel.x+2000,x+2500);
    var i = 5;
    while(i > 0)
    {
        if(nx > (x-256))
        {
            if(!(nx > (x+256)))
            {
                nx = canyon.tilePosition.x + getRandomInteger(vessel.x + 2000,x+2500);
            }
            else i = 0;
        }
        else i = 0;
        i--;
    }
    return nx;
}

function getPlaceY(big)
{
    var y;
    
    if(big == true) y = smallbarrier.y - (smallbarrier.y - vessel.y);
    else y = bigbarrier.y - (smallbarrier.y - vessel.y);
    
    var ny = getRandomInteger(50,420);
    var i = 5;
    while(i > 0)
    {
        if(ny > (y-64))
        {
            if(!(ny > (y+64)))
            {
                ny = getRandomInteger(50,420);
            }
            else i = 0;
        }
        else i = 0;
        i--;
    }
    return ny;
}

function getRandomInteger(min, max)
{
    var r = Math.floor( Math.random() * (max + 1 - min) + min );
    console.log("min:"+min+" out:"+r+" max:"+max);
    return r;
}

function sleep(ms) 
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

var lastDataURL;
function saveIMG()
{
    lastDataURL = document.getElementsByTagName("canvas")[0].toDataURL("png");
    document.getElementById("hs").src = lastDataURL;
}

function resetGame()
{
    
    bigbarrier.x = -100;
    smallbarrier.x = -100;

	distance = 0;
	score = 0;
	cryoPerc = 100;
    
    //Place Vessel back
    vessel.loadTexture('vessel');
    anim = vessel.animations.add('anim');
	vessel.animations.play('anim', 5, true);
	
	speed = 8;
	
    canyon.x = 0;
    
    placeBarrier(true);
    placeBarrier(false);
    
    gotxt.destroy();
    button.destroy();
    
	music.play();
    music.volume = 0.2;
	gosound.volume = 0.2;
	
    gameover = false;
    running = true;
}
