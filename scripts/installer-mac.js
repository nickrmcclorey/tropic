var createDMG = require('electron-installer-dmg')

options = {
    appPath: "builds/tropic-darwin-x64",
    name: "tropic",
    icon: "./gui/img/palm_trees.icns",
    out: "installers",
    overwrite: true
}

createDMG(options, console.log)