// every function in this file is pure
// it doesn't rely on, nor does it affect, any global variables

// grabbing file name from li element
function nameFromLi(li: HTMLElement): string {
    return li.children[1].textContent.trim();
}

function preparePathForCmd(path: string): string {
    let paths = path.trim().replace('/', '\\').split('\\');
    for (let k in paths) {
        if (paths[k].includes(' ')) {
            paths[k] = "\"" + paths[k] + "\"";
        }
    }
    return paths.join('\\');
}

function isNullOrWhitespace(input: string): boolean {
    return !(input != null && input.trim().length > 0);
}

export { 
    isNullOrWhitespace,
    preparePathForCmd,
    nameFromLi
}