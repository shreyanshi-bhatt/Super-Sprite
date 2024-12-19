const canvas = document.querySelector('canvas');
canvas.width = innerWidth * 0.7; // change back to 1024 in the end
canvas.height = 576;
const c = canvas.getContext('2d');
const backgroundURL = "./images/background.png";
const hillsURL = "./images/hills.png";
const platformURL = './images/platform.png';
const platformSmallTallURL = './images/platformSmallTall.png';
const spriteRunLeftURL = './images/spriteRunLeft.png';
const spriteRunRightURL = './images/spriteRunRight.png';
const spriteStandLeftURL = './images/spriteStandLeft.png';
const spriteStandRightURL = './images/spriteStandRight.png';
const finishFlagURL = './images/finishFlag.png';
const platformIMG = createImage(platformURL);
const backgroundIMG = createImage(backgroundURL);
const hillsIMG = createImage(hillsURL);
const platformSmallTallIMG = createImage(platformSmallTallURL);
const spriteRunLeftIMG = createImage(spriteRunLeftURL);
const spriteRunRightIMG = createImage(spriteRunRightURL);
const spriteStandLeftIMG = createImage(spriteStandLeftURL);
const spriteStandRightIMG = createImage(spriteStandRightURL);
const finishFlagIMG = createImage(finishFlagURL);

const topScore = 15000;
const gravity = 1;
let distance = topScore;
let score = 0;

const txt = document.getElementById('txt');
txt.innerHTML = `(Use A and D to move left and right, W to jump. Break the record to win the game! Record: ${topScore})`;

class Player {
    constructor(){
        this.position = {x: 100, y: 100};
        this.velocity = {x: 0, y: 1};
        this.width = 66;
        this.height = 150;
        this.speed = 10;
        this.frames = 0;
        this.sprites = {
            stand: {
                right: spriteStandRightIMG,
                left: spriteStandLeftIMG,
                cropWidth: 177,
                width: 66
            },
            run: {
                right: spriteRunRightIMG,
                left: spriteRunLeftIMG,
                cropWidth: 341,
                width: 127.875
            },
        }
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = this.sprites.stand.cropWidth;
    }
    draw(){
        c.drawImage(
            this.currentSprite, 
            this.currentCropWidth * this.frames,
            0,
            this.currentCropWidth,
            400,
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        );
    }
    update(){
        this.frames++;
        if(this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)){
            this.frames = 0;
        }
        else if(this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)){
            this.frames = 0;
        }
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if(this.position.y + this.height + this.velocity.y <= canvas.height){
            this.velocity.y += gravity;
        }
        else this.velocity.y = 0;
    }
}

class Platform {
    constructor({x, y, image}){
        this.position = {x: x, y: y};
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
    draw(){
        c.drawImage(
            this.image,
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        );
    }
}

class GenericObject {
    constructor({x, y, image}){
        this.position = {x: x, y: y};
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
    draw(){
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

function createImage(url){
    const image = new Image();
    image.src = url;
    return image;
}

let player = new Player();
let platforms = [];

let genericObjects = [];

let lastKey = '';
let gameActive = true;
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
}
let scrollOffset = 0;

function init(){
    player = new Player();
    platforms = [];
    let platformX = 0; // Starting x position for the first platform

    // Dynamically create platforms until scrollOffset reaches distance
    while (platformX < distance) {
        // Add a platform with gaps for variety
        const gap = Math.random() * 100 + 100; // Random gap between platforms
        const isSmallPlatform = Math.random() < 0.3; // 30% chance to add a small platform
        platforms.push(
            new Platform({
                x: platformX,
                y: isSmallPlatform ? 300 : 470, // Adjust height for small platforms
                image: isSmallPlatform ? platformSmallTallIMG : platformIMG,
            })
        );
        // Move the x position to the next platform's starting point
        platformX += (isSmallPlatform ? platformSmallTallIMG.width : platformIMG.width) + gap;
    }
    platforms.push(
        new Platform({
            x: distance - 50,
            y: 470,
            image: platformIMG
        })
    )
    genericObjects = [];
    // let backgroundX = 0;
    // let i = 1;
    // while(backgroundX < distance){
    //     genericObjects.push(
    //         new GenericObject({x: backgroundX, y: -1, image: backgroundIMG})
    //     )
    //     backgroundX += backgroundIMG.width - 3*i;
    //     i++
    // }
    genericObjects.push(
        new GenericObject({x: 0, y: 0, image: hillsIMG}),
        new GenericObject({x: -1, y: -1, image: backgroundIMG}),
        new GenericObject({x: backgroundIMG.width - 1, y: -1, image: backgroundIMG}),
        new GenericObject({x: 2 * backgroundIMG.width - 2, y: -1, image: backgroundIMG}),
    )
    
    scrollOffset = 0;
    score = 0;
    gameActive = true;
}


function animate(){
    if (!gameActive) return; // Stop the animation if the game is not active
    requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);
    genericObjects.forEach(object => {
        object.draw();
    });
    platforms.forEach(platform => {
        platform.draw();
    });
    player.update();
    if(keys.right.pressed && player.position.x < 400){
        player.velocity.x = player.speed;

    }
    else if((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)){
        player.velocity.x = -player.speed;
    }
    else{
        player.velocity.x = 0;
        if(keys.right.pressed){
            scrollOffset += player.speed;
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            })
            genericObjects.forEach(object => {
                object.position.x -= player.speed * 0.66;
            })
        }
        else if(keys.left.pressed && scrollOffset > 0){
            scrollOffset -= player.speed;
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            })
            genericObjects.forEach(object => {
                object.position.x += player.speed * 0.66;
            })
        }
    }

    // Platform collision detection
    platforms.forEach(platform => {
        if(player.position.y + player.height <= platform.position.y && player.position.y + player.height + player.velocity.y >= platform.position.y && player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width){
            player.velocity.y = 0;
        }
    })

    // sprite switching condition
    if(keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.run.right){
        player.frames = 1;
        player.currentSprite = player.sprites.run.right;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
    }
    else if(keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.run.left){
        player.currentSprite = player.sprites.run.left;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
    }
    else if(!keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.stand.left){
        player.currentSprite = player.sprites.stand.left;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
    }
    else if(!keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.stand.right){
        player.currentSprite = player.sprites.stand.right;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
    }

    score = Math.floor(scrollOffset);
    c.fillStyle = '#99beff';
    c.font = '20px Arial';
    c.fillText(`Score: ${score}`, 20, 50);

    let lineX = distance - scrollOffset + 400; // Line's x-coordinate relative to the canvas
    if (lineX > 0 && lineX < canvas.width) { // Only draw the line if it's visible on the canvas
        c.drawImage(finishFlagIMG, lineX, canvas.height - platformIMG.height - 230, 250, 250);
    }

    // win scenario
    if(scrollOffset >= distance){
        gameActive = false;
        c.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent black overlay
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.fillStyle = 'green';
        const fontSize = Math.min(canvas.width, canvas.height) * 0.05; // Adjust multiplier as needed
        c.font = `bold ${fontSize}px Courier New`;
        c.textAlign = 'center';
        c.fillText('You Win!', canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            restartGame();
        }, 3000);
    }
    // lose scenario
    if(player.position.y >= canvas.height - player.height){
        gameActive = false;
        c.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black overlay
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.fillStyle = 'red';
        const fontSize = Math.min(canvas.width, canvas.height) * 0.05; // Adjust multiplier as needed
        c.font = `bold ${fontSize}px Courier New`;
        c.textAlign = 'center';
        c.fillText('You Lost!', canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            restartGame();
        }, 3000);
    }
}

init();
animate();

function restartGame(){
    window.location.reload();
}

window.addEventListener('keydown', ({keyCode}) => {
    if (!gameActive) return; // Stop the animation if the game is not active
    switch(keyCode){
        case 65:
            // a = left
            console.log("left");
            keys.left.pressed = true;
            lastKey = 'left';
            break;
        case 83:
            // s = down
            console.log("down");
            break;
        case 68:
            // d = right
            console.log("right");
            keys.right.pressed = true;
            lastKey = 'right';
            break;
        case 87:
            // w = up
            console.log("up");
            player.velocity.y -= 20;
            break;
    }
})

window.addEventListener('keyup', ({keyCode}) => {
    if (!gameActive) return; // Stop the animation if the game is not active
    switch(keyCode){
        case 65:
            // a
            console.log("left");
            keys.left.pressed = false;
            break;
        case 83:
            // s
            console.log("down");
            break;
        case 68:
            // d
            console.log("right");
            keys.right.pressed = false;
            break;
        case 87:
            // w
            console.log("up");
            //player.velocity.y = 0; 
            break;
    }
})





