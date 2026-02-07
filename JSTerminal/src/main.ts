import XTerminal from 'xterminal';

console.log(XTerminal.version);

const term = new XTerminal();
term.mount("#terminal"); 

term.write("Hello World!\n");

term.clear();

term.write("[In Winterfell, 712pm Midday] ");



const DATA_EVENT = "data" as const;
type EVENTS = typeof DATA_EVENT | string;

//term.clearLast();

term.on(DATA_EVENT, (data)=>{
    // we should remove whitespace on either side
    console.log(data);
});

