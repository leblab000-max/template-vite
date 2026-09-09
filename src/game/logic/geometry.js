//  Pure geometry helpers, kept free of Phaser so they stay easy to unit test in isolation

export function distanceToSegment (px, py, x1, y1, x2, y2)
{
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    let t = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    const distX = px - closestX;
    const distY = py - closestY;

    return Math.sqrt(distX * distX + distY * distY);
}

export function isPointNearPath (x, y, path, clearance)
{
    for (let i = 0; i < path.length - 1; i++)
    {
        const a = path[i];
        const b = path[i + 1];

        if (distanceToSegment(x, y, a.x, a.y, b.x, b.y) <= clearance)
        {
            return true;
        }
    }

    return false;
}
