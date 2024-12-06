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
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5; // 아래로 이동
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id); // 화면 끝에 도달하면 정지
            }
        }, 300);
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
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};
let gameLoopId,heroImg,enemyImg,laserImg,lifeImg,canvas, ctx,gameObjects = [],hero,assistHeroLeft,assistHeroRight,eventEmitter = new EventEmitter();

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
    setInterval(() => {
        fireAssistLaser(assistHeroLeft);
    }, 1000); // 1초 간격

    setInterval(() => {
        fireAssistLaser(assistHeroRight);
    }, 1000); // 1초 간격
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
    const enemies = gameObjects.filter((go) => go.type === "Enemy" &&
   !go.dead);
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
        eventEmitter.clear(); // 모든 이벤트 리스너 제거, 이전 게임 세션 충돌 방지
        initGame(); // 게임 초기 상태 실행
        gameLoopId = setInterval(() => { // 100ms 간격으로 새로운 게임 루프 시작
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawPoints();
            drawLife();
            updateGameObjects();
            drawGameObjects(ctx);
        }, 100);
    }
   }
   /*
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
}*/

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
   
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -=5 ;
        assistHeroLeft.y -=5 ;
        assistHeroRight.y -=5 ;
    })
   
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 5;
        assistHeroLeft.y += 5;
        assistHeroRight.y += 5;
    });
   
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 5;
        assistHeroLeft.x -= 5;
        assistHeroRight.x -= 5;
    });
   
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 5;
        assistHeroLeft.x += 5;
        assistHeroRight.x += 5;
    });

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
            eventEmitter.emit(Messages.GAME_END_WIN);
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

   window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    destroyImg = await loadTexture("assets/laserGreenShot.png");
    lifeImg = await loadTexture("assets/life.png");

    initGame();
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects(); // 충돌 감지
        drawPoints();
        drawLife();
    }, 100)
   };
   /*
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
};*/

window.addEventListener('keydown', onKeyDown);

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
        eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
        eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
        eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
        eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if(evt.keyCode === 32) {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    } else if(evt.key === "Enter") {
        eventEmitter.emit(Messages.KEY_EVENT_ENTER);
       }
       
   });