//import './style.css'
//import typescriptLogo from './typescript.svg'
//import viteLogo from '/vite.svg'
//import { setupCounter } from './counter.ts'

import { generateGridCanvasLayer } from "./grid";
import { generatePlayerCanvasLayer } from "./player";
import type { Config } from "./types";
import { clearCanvas } from "./utility";

(() => {

  const CONFIG: Config = {
    SIZE: 32,
    WIDTH: Math.floor(32 * 60),
    HEIGHT: Math.floor(32 * 40),
    SCALE: 2
  }

  const playerCtx = generatePlayerCanvasLayer(CONFIG);
  generateGridCanvasLayer(CONFIG);

  if (!playerCtx) throw "Problem loading player canvas";

  let currentMoveTo: [Number, Number][] = [];

  const gameLoop = () => {
    runPlayerLoop(CONFIG);
    requestAnimationFrame(() => setTimeout(gameLoop, 100));
  }

  function resetMove() {
    currentMoveTo = [];
  }

  canvas.addEventListener('click', (e) => {
    currentMoveTo = getCanvasPosition()
    console.log("clicked at ", currentMoveTo)
    console.log("x: " + x + " y: " + y)
  });

  gameLoop();


})()