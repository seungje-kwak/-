class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }
    clear() {
        this.listeners = {};
    }
    }

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false; // 객체가 파괴되었는지 여부
        this.type = ""; // 객체 타입 (영웅/적)
        this.width = 0; // 객체의 폭
        this.height = 0; // 객체의 높이
        this.img = undefined; // 객체의 이미지
    }

    rectFromGameObject() {
        return {
        top: this.y,
        left: this.x,
        bottom: this.y + this.height,
        right: this.x + this.width,
        };
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height); //캔버스에 이미지 그리기
    }
   }

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        (this.width = 99), (this.height = 75);
        this.type = 'Hero';
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0; // 초기화
        this.life = 3;
        this.points = 0;
    }

    fire() {
        if (this.canFire()) { // 쿨다운 확인
            gameObjects.push(new Laser(this.x + 45, this.y - 10)); // 레이저 생성
            this.cooldown = 500; // 쿨다운 500ms 설정
            let id = setInterval(() => {
            if (this.cooldown > 0) {
                this.cooldown -= 100;
            } else {
                clearInterval(id); // 쿨다운 완료 후 타이머 종료
            }
            }, 100);
        }
    }
    canFire() {
        return this.cooldown === 0; // 쿨다운 상태 확인
    }
       
    decrementLife() {
        this.life--;
        hero.img =heroDamagedImg;
        if (this.life === 0) {
            this.dead = true;
            assistHeroLeft.dead = true;
            assistHeroRight.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
    }
       
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        // 적 캐릭터의 자동 이동 (Y축 방향)
        this.moveIntervalId = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 10; // 아래로 이동
            } else {
                console.log('Stopped at', this.y);
                clearInterval(this.moveIntervalId); // 화면 끝에 도달하면 정지
                this.dead = true;
                if (isEnemiesDead()) {
                    stage++;
                    createEnemies();
                    if(stage === 3)
                        eventEmitter.emit(Messages.GAME_END_WIN);
                }    
            }
        }, 300);
        const random = Math.floor(Math.random() * 10000) + 2000;
        this.laserIntervalId = setInterval(() => {
            if(this.dead === false)
                gameObjects.push(new EnemyLaser(this.x + 45, this.y + 10)); // 레이저 생성
            else
                clearInterval(this.laserIntervalId);
        }, random);
    }

    // 모든 타이머 정리 메서드
    clearAllIntervals() {
        clearInterval(this.moveIntervalId);
        clearInterval(this.laserIntervalId);
    }
}

class BossEnemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 300;
        this.height = 300;
        this.type = "Enemy";
    }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x,y);
        (this.width = 9), (this.height = 33);
        this.type = 'Laser';
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100)
    }
}

class EnemyLaser extends GameObject {
    constructor(x, y) {
        super(x,y);
        (this.width = 9), (this.height = 33);
        this.type = 'EnemyLaser';
        this.img = enemyLaserImg;
        let id = setInterval(() => {
            if (this.y > 0 && this.y <canvas.height) {
                this.y += 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100)
    }
}

let onKeyDown = function (e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 37: // 왼쪽 화살표
        case 39: // 오른쪽 화살표
        case 38: // 위쪽 화살표
        case 40: // 아래쪽 화살표
        case 32: // 스페이스바
            e.preventDefault();
            break;
        default:
            break;
    }
};



const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    COLLISION_HERO_ENEMYLASER: "COLLISION_HERO_ENEMYLASER",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};
const pressedKeys = {}; // 현재 눌린 키를 저장할 객체
let gameLoopId,heroImg,enemyImg,bossImg,laserImg,enemyLaserImg,lifeImg,background,backgroundPattern,heroDamagedImg,
canvas, ctx,gameObjects = [],hero,assistHeroLeft,assistHeroRight,assistHeroLazer,eventEmitter = new EventEmitter(), 
playerMoveSpeed =10, stage = 1, enemyLaser;

function loadTexture(path) {
    return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
        resolve(img);
    };
    })
}

function createEnemies() {
    if(stage === 3){
        let MONSTER_TOTAL = 5;
    
        for(let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            const MONSTER_WIDTH = MONSTER_TOTAL * 98;
            const START_X = (canvas.width - MONSTER_WIDTH) / 2;
            const STOP_X = START_X + MONSTER_WIDTH;
            
            for (let x = START_X; x < STOP_X; x += 98) {
                const enemy = new Enemy(x, y);
                enemy.img = enemyImg;
                gameObjects.push(enemy);
            }
            MONSTER_TOTAL--;
        }
    } else if (stage === 2){
        const MONSTER_TOTAL = 5;
        const MONSTER_WIDTH = MONSTER_TOTAL * 98;
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        const STOP_X = START_X + MONSTER_WIDTH;
        for (let x = START_X; x < STOP_X; x += 98) {
            for (let y = 0; y < 50 * 5; y += 50) {
                const enemy = new Enemy(x, y);
                enemy.img = enemyImg;
                gameObjects.push(enemy);
            }
        }
    } else if (stage === 1){
        const enemy = new BossEnemy(10, 200)
        enemy.img = bossImg;
        gameObjects.push(enemy);
    }
}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);

    // 보조 비행기 추가
    assistHeroLeft = new GameObject(hero.x - 60, hero.y);
    assistHeroLeft.width = hero.width * 0.5;
    assistHeroLeft.height = hero.height * 0.5;
    assistHeroLeft.img = heroImg;
    gameObjects.push(assistHeroLeft);

    assistHeroRight = new GameObject(hero.x + hero.width + 15, hero.y);
    assistHeroRight.width = hero.width * 0.5;
    assistHeroRight.height = hero.height * 0.5;
    assistHeroRight.img = heroImg;
    gameObjects.push(assistHeroRight);

    // 보조 비행기 레이저 발사 설정
    assistHeroLazer = setInterval(() => {
        fireAssistLaser(assistHeroLeft);
        fireAssistLaser(assistHeroRight);
    }, 2000); 
}

// 보조 비행기에서 레이저를 발사하는 함수
function fireAssistLaser(assistHero) {
    const laser = new Laser(assistHero.x + assistHero.width / 2 - 4.5, assistHero.y - 10);
    gameObjects.push(laser);
}

function createCollisionEffect(x, y) {
    const collisionEffect = new GameObject(x, y);
    collisionEffect.width = 50; // 효과 크기 (적절히 조정)
    collisionEffect.height = 50;
    collisionEffect.img = destroyImg; // 충돌 이미지
    gameObjects.push(collisionEffect);

    // 1초 후에 효과 제거
    setTimeout(() => {
        collisionEffect.dead = true;
    }, 1000);
}

function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
        ctx.drawImage(
        lifeImg,
        START_POS + (45 * (i+1) ),
        canvas.height - 37);
    }
}

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
}

function drawStages() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    drawText("Stage: " + stage, 10, 30);
}

function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right || // r2가 r1의 오른쪽에 있음
        r2.right < r1.left || // r2가 r1의 왼쪽에 있음
        r2.top > r1.bottom || // r2가 r1의 아래에 있음
        r2.bottom < r1.top // r2가 r1의 위에 있음
    );
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");
    const enemyLasers = gameObjects.filter((go) => go.type === "EnemyLaser");
    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                }); 

                // 충돌 효과 추가
                createCollisionEffect(m.x+25, m.y);
            }
        });
    });
    enemyLasers.forEach((l) => {
    const heroRect = hero.rectFromGameObject();
        if(intersectRect(l.rectFromGameObject(), heroRect)) {
            eventEmitter.emit(Messages.COLLISION_HERO_ENEMYLASER, {
                first: l
            });
        }
    });
    enemies.forEach(enemy => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    })
    gameObjects = gameObjects.filter((go) => !go.dead);
}

function isHeroDead() {
    return hero.life <= 0;
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);
    // 게임 화면이 겹칠 수 있으니, 200ms 지연
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (win) {
            displayMessage(
                "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
                "green"
            );
        } else {
            displayMessage(
                "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }
    }, 200)
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId); // 게임 루프 중지, 중복 실행 방지
        clearInterval(assistHeroLazer)
        // 모든 적의 타이머 제거
        gameObjects.forEach((obj) => {
        if (obj instanceof Enemy) {
            obj.clearAllIntervals(); // 각 Enemy 인스턴스의 타이머 제거
        }
        });
        eventEmitter.clear(); // 모든 이벤트 리스너 제거, 이전 게임 세션 충돌 방지

        stage = 1;
        initGame(); // 게임 초기 상태 실행
        gameLoopId = setInterval(() => { // 100ms 간격으로 새로운 게임 루프 시작
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = backgroundPattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawPoints();
            drawLife();
            drawStages();
            updateGameObjects();
            drawGameObjects(ctx);
            handleMovement();
        }, 100);
    }
   }

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
        
        if (isEnemiesDead()) {
            stage++;
            createEnemies();
            if(stage === 4)
                eventEmitter.emit(Messages.GAME_END_WIN);
        }
    });
    eventEmitter.on(Messages.COLLISION_HERO_ENEMYLASER, (_, { first }) => {
        first.dead = true;
        hero.decrementLife();

        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return; // loss before victory
        }
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();

        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return; // loss before victory
        }
        if (isEnemiesDead()) {
            stage++;
            createEnemies();
            if(stage === 4)
                eventEmitter.emit(Messages.GAME_END_WIN);
        }    
    });
    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });
       
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });
}
    
// 매 프레임마다 키 상태를 확인하여 처리
function handleMovement() {
    if (pressedKeys["ArrowUp"]) {
        hero.y -= playerMoveSpeed;
        assistHeroLeft.y -= playerMoveSpeed;
        assistHeroRight.y -= playerMoveSpeed;
    }
    if (pressedKeys["ArrowDown"]) {
        hero.y += playerMoveSpeed;
        assistHeroLeft.y += playerMoveSpeed;
        assistHeroRight.y += playerMoveSpeed;
    }
    if (pressedKeys["ArrowLeft"]) {
        hero.x -= playerMoveSpeed;
        assistHeroLeft.x -= playerMoveSpeed;
        assistHeroRight.x -= playerMoveSpeed;
    }
    if (pressedKeys["ArrowRight"]) {
        hero.x += playerMoveSpeed;
        assistHeroLeft.x += playerMoveSpeed;
        assistHeroRight.x += playerMoveSpeed;
    }
}

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("assets/player.png");
    heroDamagedImg = await loadTexture("assets/playerDamaged.png");
    heroLeftImg = await loadTexture("assets/playerLeft.png");
    heroRightImg = await loadTexture("assets/playerRight.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    bossImg = await loadTexture("assets/enemyUFO.png");
    laserImg = await loadTexture("assets/laserRed.png");
    enemyLaserImg = await loadTexture("assets/laserGreen.png");
    destroyImg = await loadTexture("assets/laserGreenShot.png");
    lifeImg = await loadTexture("assets/life.png");
    background = await loadTexture('assets/starBackground.png')
    backgroundPattern = ctx.createPattern(background, "repeat");
    

    initGame();
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects(); // 충돌 감지
        drawPoints();
        drawStages();
        drawLife();
        handleMovement();
    }, 100)
};

window.addEventListener('keydown', (evt) => {
    pressedKeys[evt.key] = true; // 누른 키를 기록
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    }
    if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    }
    if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
        assistHeroLeft.img = heroLeftImg;
        assistHeroRight.img = heroLeftImg;
    }
    if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
        assistHeroLeft.img = heroRightImg;
        assistHeroRight.img = heroRightImg;
    } 
});

window.addEventListener("keyup", (evt) => {
    delete pressedKeys[evt.key]; // 누른 키를 해제

    if (evt.key === "ArrowLeft") {
        assistHeroLeft.img = heroImg;
        assistHeroRight.img = heroImg;
    } else if (evt.key === "ArrowRight") {
        assistHeroLeft.img = heroImg;
        assistHeroRight.img = heroImg;
    } else if(evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if(evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
});