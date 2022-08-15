const fs = require("fs")
const path = require('path')

function getStartupSettings(): any {
    let setFile = cleanPath(path.join(appPath(), 'gui/settings.json'));
    if (!fs.existsSync(setFile)) {
        let defaultSet = cleanPath(path.join(appPath(), "gui/defaultSettings.json"));
        fs.copyFileSync(defaultSet, setFile);
    }

    let text = fs.readFileSync(path.join(appPath(), "gui/settings.json"), {encoding: 'utf8'})
    return JSON.parse(text)
}

function cleanPath(path: string) {
    return path.split('\\').join('\\\\');
}

function appPath(): string {
    let argument = process.argv.filter(arg => arg.startsWith('--app-path='))[0]
    return argument.slice(11)
}

export { 
    getStartupSettings,
    appPath,
    cleanPath
};