import { Scene } from 'phaser';
import { Enemy } from '../objects/Enemy';
import { Tower } from '../objects/Tower';
import { Projectile } from '../objects/Projectile';

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

        //  Kept as plain arrays (rather than one-off fields) so a future wave spawner can just
        //  keep pushing more enemies in, and towers/projectiles can loop over every one of them
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];

        this.drawBackground();
        this.drawPath();

        this.spawnEnemy();

        this.towers.push(new Tower(this, 300, 170));
    }

    update (time, delta)
    {
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
    }

    spawnEnemy (speed = 80)
    {
        const enemy = new Enemy(this, this.path, speed);

        this.enemies.push(enemy);

        return enemy;
    }

    spawnProjectile (x, y, targetX, targetY)
    {
        const projectile = new Projectile(this, x, y, targetX, targetY);

        this.projectiles.push(projectile);

        return projectile;
    }

    drawBackground ()
    {
        this.add.graphics()
            .fillStyle(0x4caf50, 1)
            .fillRect(0, 0, 800, 600);
    }

    drawPath ()
    {
        const pathWidth = 40;
        const pathColor = 0x8d6e63;

        const graphics = this.add.graphics();

        //  Draw the path as a wide stroked line
        graphics.lineStyle(pathWidth, pathColor, 1);
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
            graphics.fillCircle(point.x, point.y, pathWidth / 2);
        }
    }
}
