import type { Config, Coord } from "./types";
import { adjustCanvasSizeAndScale } from "./utility";


export function generateGridCanvasLayer(CONFIG: Config) {

    const { WIDTH, HEIGHT, SIZE } = CONFIG;

    const canvas = document.getElementById('grid') as HTMLCanvasElement;
    adjustCanvasSizeAndScale(canvas, CONFIG);

    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        console.error("Canvas does not exist");
        return;
    }

    function drawLine(start: Coord, end: Coord) {

        if(!ctx) return;

        // Define a new path
        ctx.beginPath();

        // Set a start-point
        ctx.moveTo(...start);

        // Set an end-point
        ctx.lineTo(...end);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"

        // Stroke it (Do the Drawing)
        ctx.stroke();
    }

    const numberOfRows = Math.floor(HEIGHT / SIZE);
    const numberOfColumns = Math.floor(WIDTH / SIZE);

    [...new Array(numberOfRows)].forEach((_, i) => drawLine([0, (i + 1) * SIZE], [WIDTH, (i + 1) * SIZE]));
    [...new Array(numberOfColumns)].forEach((_, i) => drawLine([(i + 1) * SIZE, 0], [(i + 1) * SIZE, HEIGHT]));

    return canvas;

}