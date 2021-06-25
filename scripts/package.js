const packager = require('electron-packager')
platform = process.argv[process.argv.length-1]

async function bundleElectronApp(opt) {
    if (platform == 'darwin')
        opt.icon="./gui/img/palm_trees.icns"

    if (platform != 'win32')
        opt.ignore.push("gui/programs")

    const appPaths = await packager(opt)
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
}

options = {
    icon: "./gui/img/palm_trees.ico",
    ignore: [ "scripts", "installers", "gui/settings.json", "webpack.config.js", "tsconfig.js", "gui/js"],
    out: "builds",
    overwrite: true,
    arch: "x64",
    platform: platform,
    dir: "."
}

bundleElectronApp(options)