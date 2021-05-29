const fs = require("fs")
const path = require('path')

function getStartupSettings() {
    let setFile = cleanPath(path.join(appPath(), 'gui/settings.json'));
    if (!fs.existsSync(setFile)) {
        let defaultSet = cleanPath(path.join(appPath(), "gui/defaultSettings.json"));
        console.log(defaultSet);
        fs.copyFileSync(defaultSet, setFile);
        console.log('moved settings file')
    }

    let text = fs.readFileSync(path.join(appPath(), "gui/settings.json"), {encoding: 'utf8'})
    return JSON.parse(text)
}

function cleanPath(p) {
    return p.split('\\').join('\\\\');
}

function appPath() {
    let argument = process.argv.filter(arg => arg.startsWith('--app-path='))[0]
    return argument.slice(11)
}

export { 
    getStartupSettings,
    appPath 
};