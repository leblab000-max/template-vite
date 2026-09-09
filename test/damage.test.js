import assert from 'node:assert/strict';
import { applyDamage, isDead } from '../src/game/logic/damage.js';

function test (name, fn)
{
    try
    {
        fn();
        console.log(`PASS: ${name}`);
    }
    catch (error)
    {
        console.error(`FAIL: ${name}`);
        console.error(error);
        process.exitCode = 1;
    }
}

test('30 HP minus 10 damage leaves 20 HP', () => {
    const health = applyDamage(30, 10);

    assert.equal(health, 20);
    assert.equal(isDead(health), false);
});

test('10 HP minus 10 damage is dead', () => {
    const health = applyDamage(10, 10);

    assert.equal(health, 0);
    assert.equal(isDead(health), true);
});

test('three consecutive hits of 10 damage reduce 30 HP to dead in order', () => {
    let health = 30;

    health = applyDamage(health, 10);
    assert.equal(health, 20);
    assert.equal(isDead(health), false);

    health = applyDamage(health, 10);
    assert.equal(health, 10);
    assert.equal(isDead(health), false);

    health = applyDamage(health, 10);
    assert.equal(health, 0);
    assert.equal(isDead(health), true);
});

test('damage never drops health below zero', () => {
    const health = applyDamage(10, 999);

    assert.equal(health, 0);
    assert.equal(isDead(health), true);
});
