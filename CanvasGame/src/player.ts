import { loadSpriteImage } from "./sprite";
import type { Config, Coord } from "./types";
import { adjustCanvasSizeAndScale, clearCanvas, getPositionOfClick } from "./utility";

export async function generatePlayerCanvasLayer(CONFIG: Config, gridCanvas: HTMLCanvasElement) {


    const { SIZE } = CONFIG;

    const canvas = document.getElementById('player') as HTMLCanvasElement;

    if (!canvas) {
        console.error("Canvas does not exist");
        return;
    }

    adjustCanvasSizeAndScale(canvas, CONFIG);

    gridCanvas.addEventListener('click', (e) => {
        currentMoveTo = getPositionOfClick(canvas, e)
        currentMoveTo = undoMoveToOffset(currentMoveTo, CONFIG);

        console.log("clicked at ", currentMoveTo);
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

    const img = await loadSpriteImage("rogues-64.png",2,2, CONFIG);

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas  
        drawPlayer(player, ctx, img);

        // Update position
        //if (x < targetX) x += 2; // Move towards target
        requestAnimationFrame(animate); // Call next frame
    }

    animate();

    // loop for the game engine
    return (collisionMap: Coord[]) => {
        clearCanvas(ctx, CONFIG);
        if (currentMoveTo.length > 0) moveToCurrent(collisionMap,currentMoveTo, player, CONFIG);
        drawPlayer(player, ctx, img);
    };
}

function undoMoveToOffset(currentMoveTo: Coord, CONFIG: Config): Coord {
    const { SIZE } = CONFIG;
    const [x, y] = currentMoveTo;

    // the moveTo command must be offset by the upper right portion of the rectangle
    return [x - SIZE/2, y - SIZE/2]
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

function moveToCurrent(collisionMap: Coord[], currentMoveTo: Coord, player, CONFIG: Config) {

    const MOVE_AMOUNT = CONFIG.SIZE;

    const [x1, y1] = [player.x, player.y];
    const [x2, y2] = currentMoveTo;

    //console.log([x1, y1], [x2, y2]);

    const MOVE_ERROR = MOVE_AMOUNT / 2;

    type direction = {west: any, east: any, south: any, north: any}

    const moveTo : direction = {
        west: ()=>player.x -= MOVE_AMOUNT,
        east: ()=>player.x += MOVE_AMOUNT,
        south: ()=>player.y -= MOVE_AMOUNT,
        north: ()=>player.y += MOVE_AMOUNT
    }

    const heading : direction = {
        west: x1 - MOVE_ERROR > x2,
        east: x1 + MOVE_ERROR < x2,
        south: y1 - MOVE_ERROR > y2,
        north: y1 + MOVE_ERROR < y2
    }

    const headingVertical = heading.south || heading.north;
    const headingHorizontal = heading.east || heading.west;


    if(headingHorizontal && headingVertical) {
        const moveHorizontal = Math.random() < 0.5;

        if(moveHorizontal) {
            
        }
    }
    else {
        // only 1 move is relevant in this scenario the find exits early on truthy,
        // we just need to find which direction is truthy which is the purpose of the find loop
        Object.keys(heading).find(direction=>{
            if(heading[direction]) {
                moveTo[direction]();
                return true;
            }
            else return false;
        });
    }

}

