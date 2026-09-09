import { GameObjects } from 'phaser';

const RADIUS = 5;
const HIT_DISTANCE = 18;

export class Projectile extends GameObjects.Arc
{
    constructor (scene, x, y, targetX, targetY, damage = 10, speed = 300)
    {
        super(scene, x, y, RADIUS, 0, 360, false, 0xffeb3b, 1);

        this.damage = damage;

        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //  Fixed heading toward where the target was at the moment of firing - it does not home in on the enemy
        this.velocityX = distance > 0 ? (dx / distance) * speed : 0;
        this.velocityY = distance > 0 ? (dy / distance) * speed : 0;

        //  Once this much distance has been travelled with no hit, the shot missed and the projectile is removed
        this.remainingDistance = distance;

        scene.add.existing(this);
    }

    update (time, delta, enemies)
    {
        const step = delta / 1000;
        const moveX = this.velocityX * step;
        const moveY = this.velocityY * step;

        this.x += moveX;
        this.y += moveY;
        this.remainingDistance -= Math.sqrt(moveX * moveX + moveY * moveY);

        for (const enemy of enemies)
        {
            if (!enemy.active)
            {
                continue;
            }

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;

            if (Math.sqrt(dx * dx + dy * dy) <= HIT_DISTANCE)
            {
                enemy.takeDamage(this.damage);
                this.destroy();
                return;
            }
        }

        if (this.remainingDistance <= 0)
        {
            this.destroy();
        }
    }
}
