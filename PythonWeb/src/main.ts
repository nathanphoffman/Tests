import './style.css'

declare global {
  var loadPyodide: any
}

(async ()=>{
 let pyodide = await loadPyodide();
  console.log(pyodide.runPython(`
        2+3
    `));
})();

