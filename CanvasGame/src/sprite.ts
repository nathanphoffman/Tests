import type { Config } from "./types";


export async function loadSpriteImage(spriteSheetPath: string, x: number, y: number, CONFIG: Config) {



  const spriteSheet = await loadSpriteSheet(spriteSheetPath);
  const sprite = await loadSpriteFromSheet(spriteSheet, x, y, CONFIG);
  return sprite;

  // write sprites to canvas


}

export async function loadSpriteFromSheet(spriteSheet: HTMLImageElement, x: number, y: number, CONFIG: Config) {

  //const memoEntry = memoize(spriteSheet, x, y);
  //if(!!memoEntry) return memoEntry;

  const { SIZE } = CONFIG;

  let temporaryCanvas = document.createElement("canvas");
  temporaryCanvas.width = temporaryCanvas.height = SIZE;
  let ctx = temporaryCanvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(spriteSheet, x * SIZE, y * SIZE, SIZE, SIZE, 0, 0, SIZE, SIZE);
  const spriteSheetData = temporaryCanvas.toDataURL("image/png");

  const img = new Image();
  img.src = spriteSheetData;
  await new Promise((resolve) => img.onload = resolve);

  //memoize({spriteSheet, x, y} ,img);
  return img;
}


export async function loadSpriteSheet(spriteSheetPath: string): Promise<HTMLImageElement> {
  let sprites = new Image();
  sprites.crossOrigin = "anonymous"

  // Load the image using a promise
  const loadImage = () => {
    return new Promise((resolve, reject) => {
      sprites.onload = () => resolve(sprites);
      sprites.onerror = () => reject(new Error("Failed to load spritesheet."));
      sprites.src = spriteSheetPath;
    });
  };

  await loadImage();

  return sprites;
}
