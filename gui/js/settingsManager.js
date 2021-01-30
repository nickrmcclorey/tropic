const fs = require("fs")
const path = require('path')

function getStartupSettings() {
    let setFile = process.cwd();
    setFile = path.join(setFile, 'gui/settings.json') 
    if (!fs.existsSync(setFile)) {
        let defaultSet = path.join(process.cwd(), "gui/defaultSettings.json");
        fs.copyFileSync(defaultSet, setFile);
        console.log('moved settings file')
    }

    let text = fs.readFileSync("./gui/settings.json", {encoding: 'utf8'})
    return JSON.parse(text)
}

export { getStartupSettings }