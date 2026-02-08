import type { Config } from "./types";

export function adjustCanvasSizeAndScale(canvas: HTMLCanvasElement, CONFIG: Config) {

    const { WIDTH, HEIGHT, SCALE } = CONFIG;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const ctx = canvas.getContext("2d");
    ctx?.scale(SCALE, SCALE);
}

export function clearCanvas(ctx: CanvasRenderingContext2D, CONFIG: Config) {
    const { WIDTH, HEIGHT } = CONFIG;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
