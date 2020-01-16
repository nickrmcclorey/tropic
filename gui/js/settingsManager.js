
function getStartupSettings() {
    if (!fs.existsSync("./gui/settings.json")) {
        fs.copyFileSync("./gui/defaultSettings.json", "./gui/settings.json")
    }

    let text = fs.readFileSync("./gui/settings.json", {encoding: 'utf8'})
    return JSON.parse(text)
}