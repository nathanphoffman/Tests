import type { Config, Coord } from "./types";

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

export function getPositionOfClick(canvas: HTMLCanvasElement, e: PointerEvent): Coord {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x, y];
}

export function futureCollisionOnAxis(moveAmount: number, player: any, coord: Coord, axis: "x" | "y", CONFIG: Config) {

    const coordKey = {
        x: 0,
        y: 1
    }

    const key = coordKey[axis];

    const gridPositionOfCollision = coord[key] * 64;
    const gridFuturePositionOfPlayer = player[axis] + moveAmount;
    const halfGridSquare = CONFIG.SIZE / 2;

    const collisionOnAxisDistance = Math.abs(gridPositionOfCollision - gridFuturePositionOfPlayer);
    const collisionOnAxis = collisionOnAxisDistance <= halfGridSquare;

    return collisionOnAxis;
}


/*
export function memoize(obj: any, ) {
    Object.keys.find((key)=>{

    })
}
    */