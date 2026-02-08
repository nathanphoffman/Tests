import type { Config } from "./types";


export async function loadSpriteImage(spriteSheetPath: string, x: number, y: number, CONFIG: Config) {

  const { SIZE } = CONFIG;

  // load in sprites
  let sprites = new Image();
  sprites.crossOrigin = "anonymous"


  //sprites.src = spriteSheetPath;
  //await sprites.onload;

  // Load the image using a promise
  const loadImage = () => {
    return new Promise((resolve, reject) => {
      sprites.onload = () => resolve(sprites);
      sprites.onerror = () => reject(new Error("Failed to load image."));
      sprites.src = spriteSheetPath;
    });
  };

  // Wait for the image to load
  await loadImage();



  // write sprites to canvas
  let temporaryCanvas = document.createElement("canvas");
  temporaryCanvas.width = temporaryCanvas.height = SIZE;
  let ctx = temporaryCanvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(sprites, x * SIZE, y * SIZE, SIZE, SIZE, 0, 0, SIZE, SIZE);
  const spriteSheetData = temporaryCanvas.toDataURL("image/png");

  const img = new Image();
  img.src = spriteSheetData;
  await new Promise((resolve) => img.onload = resolve);
  return img;

}


/*
export function loadSprite2(fn) {

  let temporaryCanvas = document.createElement("canvas");
  let ctx = temporaryCanvas.getContext("2d");
  temporaryCanvas.width = temporaryCanvas.height = 32;

  let sprites = new Image();
  sprites.crossOrigin = "anonymous"
  sprites.src = 'rogues.png';
  //sprites.onload = getTiles

  function getTile(x, y) {
    ctx.drawImage(sprites, 0, 0, 32, 32, 0, 0, 32, 32);
    console.log(temporaryCanvas.toDataURL("image/png"));
    return temporaryCanvas.toDataURL("image/png");
  }

  sprites.onload = function () {

    var sprite = getTile(2, 1);
    fn(sprite);

  }
}

setTimeout(() => {

  loadSprite((imgsrc) => {
    const img = new Image();
    img.src = imgsrc;

    img.onload = function () {
      ctx.drawImage(img, 0, 0, 32, 32); // Adjust the position and size as needed
    }

  });
}, 1000);
*/