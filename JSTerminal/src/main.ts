//import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'

//import { setupCounter } from './counter.ts'
import { Terminal } from '@xterm/xterm';
import { SerializeAddon } from "@xterm/addon-serialize";

const PREFIX = ' $ ';
const PREFIX_NEWLINE = `\n${PREFIX}`;
const EMPTY = "";


// Keys
const ENTER = '\r';
const BACKSPACE = '\x7f';
const LEFTARROW = '\x1B[D';

const terminalElement = document.getElementById('terminal');
const terminal = new Terminal();
const serializeAddon = new SerializeAddon();
terminal.loadAddon(serializeAddon);


let charactersOnCurrentLine = "";


function removeLastCharacters(charactersToRemove: number) {
  [...new Array(charactersToRemove)].map(() => terminal.write('\b \b'));
}

function moveCursorLeft(spacesToMove: number) {
  [...new Array(spacesToMove)].map(() => terminal.write(LEFTARROW));
}

function clearCurrentLine() {
  charactersOnCurrentLine = EMPTY;
}

function performValidation(command: string) {

  // built in commands
  if (command === "clear") {
    terminal.reset();
    return { error: false, message: undefined };
  }
  else if (command.length > 20) {
    return { error: true, message: "Command is too long" };
  }
  else return { error: false, message: '' };

}

if (terminalElement) {
  terminal.open(terminalElement);
  terminal.write(PREFIX)

  terminal.onKey((input) => {

    if (input.key === ENTER) {

      const output = performValidation(charactersOnCurrentLine);

      // if it was cleared we need to not render an enter and just rerender the prefix
      if(output.message === undefined) {
        terminal.write(PREFIX);
        return;
      }

      // we must remove the characters from the buffer otherwise the cursor will shift right
      moveCursorLeft(charactersOnCurrentLine.length + PREFIX.length);

      if (output.error) {
        const line = `\n   \x1B[38;2;255;165;0m${output.message}\x1B[0m\n`;
        terminal.write(line);
        moveCursorLeft(line.length);
      }

      console.log("enter hit", charactersOnCurrentLine);
      clearCurrentLine();

      ///terminal.write(terminal);
      terminal.write(PREFIX_NEWLINE);


    } else if (input.key === BACKSPACE) {
      // Get current cursor position  
      const cursorX = terminal.buffer.active.cursorX;
      if (cursorX > PREFIX.length) { // Don't backspace past the prompt ($ )  

        // erase last character, two \b are required as the first moves the cursor, the second the character
        // the space is needed otherwise the cursor moves twice
        removeLastCharacters(1);
      }
    }
    else {
      terminal.write(input.key);
      charactersOnCurrentLine += input.key;
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
