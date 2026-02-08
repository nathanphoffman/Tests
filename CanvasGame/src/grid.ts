import type { Config, Coord } from "./types";


export function generateGridCanvasLayer(CONFIG: Config) {

    const { WIDTH, HEIGHT, SIZE } = CONFIG;

    const canvas = document.getElementById('gameCanvas2') as HTMLCanvasElement;
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
        ctx.strokeStyle = "#aaa"

        // Stroke it (Do the Drawing)
        ctx.stroke();
    }

    const numberOfRows = Math.floor(HEIGHT / SIZE);
    const numberOfColumns = Math.floor(WIDTH / SIZE);

    [...new Array(numberOfRows)].forEach((x, i) => drawLine([0, (i + 1) * SIZE], [WIDTH, (i + 1) * SIZE]));
    [...new Array(numberOfColumns)].forEach((x, i) => drawLine([(i + 1) * SIZE, 0], [(i + 1) * SIZE, HEIGHT]));


}