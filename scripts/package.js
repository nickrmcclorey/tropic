const packager = require('electron-packager')

async function bundleElectronApp(opt) {
    if (process.argv[1] == 'darwin')
        opt.icon="./gui/img/palm_trees.icns"

    const appPaths = await packager(opt)
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
}

platform = process.argv[process.argv.length-1]
options = {
    icon: "./gui/img/palm_trees.ico",
    ignore: [ "scripts", "gui/settings.json", "gui/js"],
    out: "builds",
    overwrite: true,
    arch: "x64",
    platform: platform,
    dir: "."
}

bundleElectronApp(options)