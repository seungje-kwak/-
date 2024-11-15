function loadTexture(path) {
    return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
    resolve(img);
    };
    })
   }

function createEnemies(ctx, canvas, enemyImg) {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;
    
    for (let x = START_X; x < STOP_X; x += enemyImg.width) {
        for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

function createEnemies2(ctx, canvas, enemyImg) {
    let MONSTER_TOTAL = 5;
    
    for(let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
        const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        const STOP_X = START_X + MONSTER_WIDTH;
        
        for (let x = START_X; x < STOP_X; x += enemyImg.width) {
            ctx.drawImage(enemyImg, x, y);
        }
        MONSTER_TOTAL--;
    }
}

window.onload = async() => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const heroImg = await loadTexture('assets/player.png')
    const enemyImg = await loadTexture('assets/enemyShip.png')
    const assistHeroImg = await loadTexture('assets/player.png')
    const assistHeroWidth = assistHeroImg.width*0.5;
    const assistHeroHeight = assistHeroImg.height*0.5;
    const background = await loadTexture('assets/starBackground.png')
    const backgroundPattern = ctx.createPattern(background, "repeat");
    ctx.fillStyle = backgroundPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    ctx.drawImage(assistHeroImg, canvas.width/2 - 90 , canvas.height - (canvas.height / 4), assistHeroWidth, assistHeroHeight);
    ctx.drawImage(heroImg, canvas.width/2 - 45, canvas.height - (canvas.height /4));
    ctx.drawImage(assistHeroImg, canvas.width/2 + 45, canvas.height - (canvas.height / 4), assistHeroWidth, assistHeroHeight);

    createEnemies2(ctx, canvas, enemyImg);
};

        