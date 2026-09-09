import { GameObjects } from 'phaser';

export class Enemy extends GameObjects.Arc
{
    constructor (scene, path, speed = 80)
    {
        const start = path[0];

        super(scene, start.x, start.y, 12, 0, 360, false, 0xff0000, 1);

        this.path = path;
        this.speed = speed;
        this.targetIndex = 1;

        scene.add.existing(this);
    }

    update (time, delta)
    {
        if (this.targetIndex >= this.path.length)
        {
            return;
        }

        let remaining = this.speed * (delta / 1000);

        //  Recompute direction toward the current waypoint every step, and carry any
        //  leftover distance into the next segment so speed stays constant through a turn
        //  instead of stalling at the corner until the next frame.
        while (remaining > 0 && this.targetIndex < this.path.length)
        {
            const target = this.path[this.targetIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

            if (distanceToTarget <= remaining)
            {
                this.setPosition(target.x, target.y);
                remaining -= distanceToTarget;
                this.targetIndex++;
            }
            else
            {
                const angle = Math.atan2(dy, dx);

                this.x += Math.cos(angle) * remaining;
                this.y += Math.sin(angle) * remaining;
                remaining = 0;
            }
        }

        if (this.targetIndex >= this.path.length)
        {
            this.destroy();
        }
    }
}
