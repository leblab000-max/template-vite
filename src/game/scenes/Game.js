import { Scene } from 'phaser';
import { Enemy } from '../objects/Enemy';
import { Tower, TOWER_RADIUS } from '../objects/Tower';
import { Projectile } from '../objects/Projectile';
import { isPointNearPath } from '../logic/geometry';

const PATH_WIDTH = 40;
const TOWER_COST = 20;
const TOWER_MIN_SEPARATION = TOWER_RADIUS * 2 + 8;
const SPAWN_INTERVAL = 1000;
const WAVE_DELAY = 3000;

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        //  Path the enemies will later follow: enters left, snakes through the field, exits right
        this.path = [
            { x: 0, y: 100 },
            { x: 600, y: 100 },
            { x: 600, y: 250 },
            { x: 150, y: 250 },
            { x: 150, y: 420 },
            { x: 680, y: 420 },
            { x: 680, y: 500 },
            { x: 800, y: 500 }
        ];

        //  Kept as plain arrays so the wave spawner can just keep pushing more enemies in,
        //  and towers/projectiles can loop over every one of them
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.gold = 0;

        this.drawBackground();
        this.drawPath();

        this.goldText = this.add.text(16, 16, 'Gold: 0', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffd700',
            stroke: '#000000', strokeThickness: 4
        });

        this.waveText = this.add.text(16, 44, 'Wave: 1', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4
        });

        this.buildMessageText = this.add.text(400, 570, '', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ff5555',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        this.towers.push(new Tower(this, 300, 170));

        this.startWave(1);

        this.input.on('pointerdown', (pointer) => this.tryBuildTower(pointer.x, pointer.y));
    }

    update (time, delta)
    {
        this.tickWaveSpawner(delta);

        for (const enemy of this.enemies)
        {
            enemy.update(time, delta);
        }

        this.enemies = this.enemies.filter((enemy) => enemy.active);

        for (const tower of this.towers)
        {
            tower.update(time, delta, this.enemies);
        }

        for (const projectile of this.projectiles)
        {
            projectile.update(time, delta, this.enemies);
        }

        this.projectiles = this.projectiles.filter((projectile) => projectile.active);

        this.tickWaveState(delta);
    }

    //  --- Waves ---------------------------------------------------------

    startWave (waveNumber)
    {
        this.wave = waveNumber;
        this.enemiesInWave = 5 + this.wave * 2;
        this.enemiesRemainingToSpawn = this.enemiesInWave;
        this.spawnCooldown = 0;
        this.waveState = 'spawning';

        this.waveText.setText(`Wave: ${this.wave}`);
    }

    tickWaveSpawner (delta)
    {
        if (this.waveState !== 'spawning' || this.enemiesRemainingToSpawn <= 0)
        {
            return;
        }

        this.spawnCooldown -= delta;

        if (this.spawnCooldown <= 0)
        {
            this.spawnEnemy();
            this.enemiesRemainingToSpawn--;
            this.spawnCooldown = SPAWN_INTERVAL;
        }
    }

    tickWaveState (delta)
    {
        if (this.waveState === 'spawning')
        {
            //  A wave is done once every enemy has been spawned and none of them are left alive
            if (this.enemiesRemainingToSpawn <= 0 && this.enemies.length === 0)
            {
                this.waveState = 'waiting';
                this.waveCooldown = WAVE_DELAY;
            }
        }
        else if (this.waveState === 'waiting')
        {
            this.waveCooldown -= delta;

            if (this.waveCooldown <= 0)
            {
                this.startWave(this.wave + 1);
            }
        }
    }

    //  --- Spawning --------------------------------------------------------

    spawnEnemy (speed = 80)
    {
        const enemy = new Enemy(this, this.path, speed);

        this.enemies.push(enemy);

        return enemy;
    }

    spawnProjectile (x, y, targetX, targetY, damage = 10)
    {
        const projectile = new Projectile(this, x, y, targetX, targetY, damage);

        this.projectiles.push(projectile);

        return projectile;
    }

    //  --- Tower building ----------------------------------------------

    tryBuildTower (x, y)
    {
        if (isPointNearPath(x, y, this.path, PATH_WIDTH / 2 + TOWER_RADIUS))
        {
            this.showBuildMessage("Can't build on the path");
            return;
        }

        if (this.isNearExistingTower(x, y))
        {
            this.showBuildMessage("Can't build here");
            return;
        }

        if (this.gold < TOWER_COST)
        {
            this.showBuildMessage('Not enough gold');
            return;
        }

        this.gold -= TOWER_COST;
        this.goldText.setText(`Gold: ${this.gold}`);

        this.towers.push(new Tower(this, x, y));
    }

    isNearExistingTower (x, y)
    {
        return this.towers.some((tower) => {
            const dx = tower.x - x;
            const dy = tower.y - y;

            return Math.sqrt(dx * dx + dy * dy) < TOWER_MIN_SEPARATION;
        });
    }

    showBuildMessage (text)
    {
        this.buildMessageText.setText(text);

        if (this.buildMessageEvent)
        {
            this.buildMessageEvent.remove();
        }

        this.buildMessageEvent = this.time.delayedCall(1500, () => this.buildMessageText.setText(''));
    }

    //  --- Gold -------------------------------------------------------------

    awardGold (amount)
    {
        this.gold += amount;
        this.goldText.setText(`Gold: ${this.gold}`);

        console.log(`+${amount} gold (total: ${this.gold})`);
    }

    //  --- Drawing -----------------------------------------------------

    drawBackground ()
    {
        this.add.graphics()
            .fillStyle(0x4caf50, 1)
            .fillRect(0, 0, 800, 600);
    }

    drawPath ()
    {
        const pathColor = 0x8d6e63;

        const graphics = this.add.graphics();

        //  Draw the path as a wide stroked line
        graphics.lineStyle(PATH_WIDTH, pathColor, 1);
        graphics.beginPath();
        graphics.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++)
        {
            graphics.lineTo(this.path[i].x, this.path[i].y);
        }

        graphics.strokePath();

        //  Round off the corners by filling a circle at each waypoint
        graphics.fillStyle(pathColor, 1);

        for (const point of this.path)
        {
            graphics.fillCircle(point.x, point.y, PATH_WIDTH / 2);
        }
    }
}
