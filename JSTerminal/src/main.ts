import XTerminal from 'xterminal';

console.log(XTerminal.version);

const term = new XTerminal();
term.mount("#terminal");

term.write("Hello World!\n");

term.clear();


const TAILWIND_STYLES = ["italic", "text-stone-400", "text-white", "text-stone-200"] as const;
type tailwind_styles = typeof TAILWIND_STYLES[number];


function addPrefix() {
    term.write("[In Winterfell, July 4th 7:12pm] ");
}

function write(text: string, ...tailwind: tailwind_styles[]) {
    if (!tailwind?.length) return text;
    else return `<span class="${tailwind.join(' ')}">${text}</span>`;
}

function description(text: string) {
    return write(text, "italic", "text-stone-400");
}

function notable(text: string) {
    return write(text, "text-stone-200");
}

function warning(text: string) {
    return write(text, "text-stone-200");

}

function alert() {

}

function systemError() {

}

function writeLine(...output: string[]) {
    output.forEach((line) => {
        term.write(`${line}\n`)
    });

    addPrefix();
}

writeLine(
    description("It is raining outside, rain pelts the roof of the tavern."),
    notable("There is an enemy here"),
    description("and then the rain can be heard again")
);



const DATA_EVENT = "data" as const;
type EVENTS = typeof DATA_EVENT | string;

//term.clearLast();

term.on(DATA_EVENT, (data) => {
    // we should remove whitespace on either side
    console.log(data);
});

