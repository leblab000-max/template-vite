import { GameObjects } from 'phaser';
import { Projectile } from './Projectile';

const RADIUS = 14;
const BARREL_LENGTH = 20;

export class Tower extends GameObjects.Container
{
    constructor (scene, x, y, range = 150, fireRate = 800, damage = 10)
    {
        super(scene, x, y);

        this.range = range;
        this.fireRate = fireRate;
        this.damage = damage;
        this.fireCooldown = 0;
        this.target = null;

        const base = new GameObjects.Arc(scene, 0, 0, RADIUS, 0, 360, false, 0x2196f3, 1);
        this.barrel = new GameObjects.Rectangle(scene, RADIUS, 0, BARREL_LENGTH, 6, 0x1565c0, 1).setOrigin(0, 0.5);

        this.add([ base, this.barrel ]);

        scene.add.existing(this);
    }

    update (time, delta, enemies)
    {
        this.target = this.findTarget(enemies);

        if (this.target)
        {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

            this.barrel.setRotation(angle);
        }

        this.fireCooldown -= delta;

        if (this.target && this.fireCooldown <= 0)
        {
            this.shoot(this.target);
            this.fireCooldown = this.fireRate;
        }
    }

    findTarget (enemies)
    {
        let closest = null;
        let closestDistance = this.range;

        for (const enemy of enemies)
        {
            if (!enemy.active)
            {
                continue;
            }

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= closestDistance)
            {
                closest = enemy;
                closestDistance = distance;
            }
        }

        return closest;
    }

    shoot (target)
    {
        this.scene.spawnProjectile(this.x, this.y, target.x, target.y, this.damage);
    }
}
