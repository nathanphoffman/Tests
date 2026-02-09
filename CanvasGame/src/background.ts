import { loadSpriteImage } from "./sprite";
import type { Config } from "./types";
import { adjustCanvasSizeAndScale } from "./utility";

export async function generateBackgroundLayer(CONFIG: Config) {

    const { WIDTH, HEIGHT, SIZE } = CONFIG;

    const canvas = document.getElementById('background') as HTMLCanvasElement;
    adjustCanvasSizeAndScale(canvas, CONFIG);
    
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "green";
    ctx.fill(); 
/*
    const img = await loadSpriteImage("tiles-64.png",3,25, CONFIG);
    ctx.drawImage(img as any, 64*1, 64*1, SIZE, SIZE);

    const img2 = await loadSpriteImage("tiles-64.png",3,24, CONFIG);
    ctx.drawImage(img2 as any, 64*1, 64*0, SIZE, SIZE);
*/
}