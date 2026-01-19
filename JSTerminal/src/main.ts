//import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'

//import { setupCounter } from './counter.ts'
import { Terminal } from '@xterm/xterm';

const ENTER = '\r';
const PREFIX = ' $ ';
const PREFIX_NEWLINE = `\n${PREFIX}`;

const terminalElement = document.getElementById('terminal');
const terminal = new Terminal();
if (terminalElement) {
  terminal.open(terminalElement);
  terminal.write(' $ ')
  terminal.onKey((input) => {
    
    if (input.key === ENTER) {
      console.log("enter hit")
      ///terminal.write(terminal);
      terminal.write('\n');

    } else if (input.key === '\x7f') { // Backspace  
      // Get current cursor position  
      const cursorX = terminal.buffer.active.cursorX;
      if (cursorX > PREFIX.length) { // Don't backspace past the prompt ($ )  
        terminal.write('\b \b'); // Erase last character  
      }
    }
    else {
      terminal.write(input.key);
    }
  });


}

/*
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`
*/
//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
