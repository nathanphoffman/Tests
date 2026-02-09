import { loadSpriteImage } from "./sprite";
import { adjustCanvasSizeAndScale } from "./utility";

export async function generadeDoodadsLayer(CONFIG: Config) {

    const { WIDTH, HEIGHT, SIZE } = CONFIG;

    const canvas = document.getElementById('doodads') as HTMLCanvasElement;
    adjustCanvasSizeAndScale(canvas, CONFIG);
    
    const ctx = canvas.getContext("2d");
    if(!ctx) return;


    let collisionMap = [];
    const doodads = getDoodadLibrary(ctx, CONFIG, collisionMap);
    const { treeTop, treeBottom, tree1, tree2 } = doodads;

    

    treeTop(2,2);
    treeBottom(2,3);

    tree1(3,3);
    tree2(3,5);

}

function getDoodadLibrary(ctx: CanvasRenderingContext2D, CONFIG: Config, collisionMap: any) {

    const tiles = spriteSheetFn(ctx,"tiles-64.png",CONFIG, collisionMap);

    return {
        treeTop: tiles(3,24, false),
        treeBottom: tiles(3,25),
        tree1: tiles(1,25),
        tree2: tiles(2,25),
    }
}

function spriteSheetFn(ctx: CanvasRenderingContext2D, sheet: string, CONFIG: Config, collisionMap: any) {

    const { SIZE } = CONFIG;
    const img = await loadSpriteImage(sheet,sheetX,sheetY, CONFIG);
    
    return (sheetX,sheetY, collision: boolean = true)=> async (x,y) =>{

        ctx.drawImage(img as any, SIZE * x, SIZE * y, SIZE, SIZE);
    }
}