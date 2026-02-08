import type { Config } from "./types";
import { adjustCanvasSizeAndScale, clearCanvas } from "./utility";


export function runPlayerLoop() {
    clearCanvas(playerCtx, CONFIG);
    if (currentMoveTo.length > 0) moveToCurrent();
    drawPlayer();
}

export function generatePlayerCanvasLayer(CONFIG: Config) {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas does not exist");
        return;
    }

    adjustCanvasSizeAndScale(canvas, CONFIG);

    const ctx = canvas.getContext('2d');

    let x = 0; // Starting x position
    let y = 50; // Starting y position
    //const targetX = 300; // Target x position
    //const targetY = 50; // Target y position
    const MOVE_AMOUNT = SIZE;

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        ctx.fillStyle = 'blue'; // Set color
        ctx.fillRect(x, y, 10, 10); // Draw point

        // Update position
        //if (x < targetX) x += 2; // Move towards target
        requestAnimationFrame(animate); // Call next frame
    }

    //animate(); // Start animation

    let player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: SIZE,
        color: 'blue'
    };

    return ctx;

}




function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function getCanvasPosition() {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left - player.size / 2.25
    const y = event.clientY - rect.top - player.size / 2.25
    return [x, y]
}

function moveToCurrent() {
    const [x1, y1] = [player.x, player.y];
    const [x2, y2] = currentMoveTo;

    //console.log([x1, y1], [x2, y2]);

    const MOVE_ERROR = MOVE_AMOUNT / 2;

    if (x1 - MOVE_ERROR > x2) player.x -= MOVE_AMOUNT;
    if (x1 + MOVE_ERROR < x2) player.x += MOVE_AMOUNT;
    if (y1 - MOVE_ERROR > y2) player.y -= MOVE_AMOUNT;
    if (y1 + MOVE_ERROR < y2) player.y += MOVE_AMOUNT;


}