//import './style.css'
//import typescriptLogo from './typescript.svg'
//import viteLogo from '/vite.svg'
//import { setupCounter } from './counter.ts'

import { generateGridCanvasLayer } from "./grid";
import { generatePlayerCanvasLayer } from "./player";
import type { Config } from "./types";

(() => {

  const CONFIG: Config = {
    SIZE: 32,
    WIDTH: Math.floor(32 * 15),
    HEIGHT: Math.floor(32 * 10),
    SCALE: 1
  }

  // the grid canvas lays on top so we attach even listeners to it
  const gridCanvas = generateGridCanvasLayer(CONFIG);
  if (!gridCanvas) throw "Grid canvas not generated";

  const playerLoop = generatePlayerCanvasLayer(CONFIG, gridCanvas);

  const gameLoop = () => {
    if (playerLoop) playerLoop();
    requestAnimationFrame(() => setTimeout(gameLoop, 100));
  }

  gameLoop();

})()