//  Pure damage math, kept free of Phaser so it can be unit tested with plain Node (see test/damage.test.js)

export function applyDamage (health, amount)
{
    return Math.max(0, health - amount);
}

export function isDead (health)
{
    return health <= 0;
}
