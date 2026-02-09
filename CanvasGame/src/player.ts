import { playMusic } from "./sound";
import { loadSpriteImage } from "./sprite";
import type { Config, Coord } from "./types";
import { adjustCanvasSizeAndScale, clearCanvas, futureCollisionOnAxis, getPositionOfClick } from "./utility";

export async function generatePlayerCanvasLayer(CONFIG: Config, gridCanvas: HTMLCanvasElement) {


    const { SIZE } = CONFIG;

    const canvas = document.getElementById('player') as HTMLCanvasElement;

    if (!canvas) {
        console.error("Canvas does not exist");
        return;
    }

    adjustCanvasSizeAndScale(canvas, CONFIG);

    gridCanvas.addEventListener('click', (e) => {

        playMusic();

        currentMoveTo = getPositionOfClick(canvas, e)
        currentMoveTo = undoMoveToOffset(currentMoveTo, CONFIG);

        //console.log("clicked at ", currentMoveTo);
    });

    let player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: SIZE,
        color: 'blue'
    };

    let currentMoveTo: Coord = [player.x, player.y];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = await loadSpriteImage("rogues-64.png", 2, 2, CONFIG);

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas  
        drawPlayer(player, ctx, img);
        if (currentMoveTo && currentMoveTo.length) drawMoveTo(currentMoveTo, ctx, CONFIG);
        // Update position
        //if (x < targetX) x += 2; // Move towards target
        requestAnimationFrame(animate); // Call next frame
    }

    animate();

    // loop for the game engine
    return (collisionMap: Coord[]) => {
        clearCanvas(ctx, CONFIG);
        if (currentMoveTo.length > 0) moveToCurrent(collisionMap, currentMoveTo, player, CONFIG);
        if (currentMoveTo && currentMoveTo.length) drawMoveTo(currentMoveTo, ctx, CONFIG);
        //drawPlayer(player, ctx, img);
    };
}

function undoMoveToOffset(currentMoveTo: Coord, CONFIG: Config): Coord {
    const { SIZE } = CONFIG;
    const [x, y] = currentMoveTo;

    // the moveTo command must be offset by the upper right portion of the rectangle
    return [x - SIZE / 2, y - SIZE / 2]
}

function drawPlayer(player, ctx: CanvasRenderingContext2D, img: any) {

    const { x, y, size, color } = player;
    ctx.fillStyle = color;

    // player is a square so both sizes for x and y scale are equal

    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.stroke();

    ctx.drawImage(img as any, x, y, size, size);
}

function drawMoveTo(currentMoveTo: Coord, ctx: CanvasRenderingContext2D, CONFIG: Config) {

    //console.log("currentmoveto is", currentMoveTo);

    const { SIZE } = CONFIG;
    //ctx.fillStyle = "blue";
    ctx.beginPath();

    // we have to center on the square by taking 0.5 the size of a 64 space
    ctx.rect(Math.ceil(currentMoveTo[0] / SIZE - 0.5) * SIZE, Math.ceil(currentMoveTo[1] / SIZE - 0.5) * SIZE, SIZE, SIZE);
    ctx.stroke();
}

let flipFlop = false;

function moveToCurrent(collisionMap: Coord[], currentMoveTo: Coord, player: any, CONFIG: Config) {

    const MOVE_AMOUNT = CONFIG.SIZE;

    const [x1, y1] = [player.x, player.y];
    const [x2, y2] = currentMoveTo;

    const MOVE_ERROR = MOVE_AMOUNT / 2;

    type direction = { west: any, east: any, south: any, north: any }

    const move = (axis: "x" | "y", amount: number) => {

        const newPosition = player[axis] + amount;

        //console.log(collisionMap);

        const collisionDetected = collisionMap.find(coord => {

            // opposite of the moving axis:
            const staticAxis = axis === "x" ? "y" : "x";

            const collisionOnMovingAxis = futureCollisionOnAxis(amount, player, coord, axis, CONFIG);
            const collisionOnStaticAxis = futureCollisionOnAxis(0, player, coord, staticAxis, CONFIG);

            return collisionOnStaticAxis && collisionOnMovingAxis;
        });

        if (collisionDetected) return () => { };

        //console.log(currentMoveTo, player)
        return () => player[axis] += amount;
    }

    const moveTo: direction = {
        west: move("x", -MOVE_AMOUNT),
        east: move("x", +MOVE_AMOUNT),
        south: move("y", -MOVE_AMOUNT),
        north: move("y", MOVE_AMOUNT)
    }

    const heading: direction = {
        west: x1 - MOVE_ERROR > x2,
        east: x1 + MOVE_ERROR < x2,
        south: y1 - MOVE_ERROR > y2,
        north: y1 + MOVE_ERROR < y2
    }

    const headingVertical = heading.south || heading.north;
    const headingHorizontal = heading.east || heading.west;

    if (headingHorizontal && headingVertical) {
        const moveHorizontal = flipFlop = !flipFlop;

        if (moveHorizontal) {
            if (heading.west) moveTo.west();
            else if (heading.east) moveTo.east();
        }
        else {
            if (heading.south) moveTo.south();
            else if (heading.north) moveTo.north();
        }
    }
    else {
        // only 1 move is relevant in this scenario the find exits early on truthy,
        // we just need to find which direction is truthy which is the purpose of the find loop
        Object.keys(heading).find(direction => {
            if (heading[direction]) {
                moveTo[direction]();
                return true;
            }
            else return false;
        });
    }

}
