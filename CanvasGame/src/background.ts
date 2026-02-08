import type { Config } from "./types";
import { adjustCanvasSizeAndScale } from "./utility";

export function generateBackgroundLayer(CONFIG: Config) {

    const { WIDTH, HEIGHT, SIZE } = CONFIG;

    const canvas = document.getElementById('background') as HTMLCanvasElement;
    adjustCanvasSizeAndScale(canvas, CONFIG);
    
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "green";
    ctx.fill(); 

}