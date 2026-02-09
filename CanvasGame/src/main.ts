//import './style.css'
//import typescriptLogo from './typescript.svg'
//import viteLogo from '/vite.svg'
//import { setupCounter } from './counter.ts'

import { generateBackgroundLayer } from "./background";
import { generadeDoodadsLayer } from "./doodads";
import { generateGridCanvasLayer } from "./grid";
import { generatePlayerCanvasLayer } from "./player";
import { playMusic } from "./sound";

import type { Config } from "./types";

(async () => {

  const CONFIG: Config = {
    SIZE: 64,
    WIDTH: Math.floor(64 * 16),
    HEIGHT: Math.floor(64 * 12),
    SCALE: 1
  }

  // the grid canvas lays on top so we attach even listeners to it
  const gridCanvas = generateGridCanvasLayer(CONFIG);
  if (!gridCanvas) throw "Grid canvas not generated";
  const playerLoop = await generatePlayerCanvasLayer(CONFIG, gridCanvas);

  await generateBackgroundLayer(CONFIG);
  const collisionMap = await generadeDoodadsLayer(CONFIG);

  //playMusic();

  // once all assets are loaded we start the game
  const gameLoop = () => {
    if (playerLoop) playerLoop(collisionMap);

    // start the game at approximately 4fps
    requestAnimationFrame(() => setTimeout(gameLoop, 250));
  }

  gameLoop();

})()