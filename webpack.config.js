
module.exports = {
    entry: "./gui/index.js",
    target: "node",
    mode: "development",
    output: {
        path: __dirname + "/gui",
        filename: "dist.js"
    },
    externals: {
        settings: "settings"
    }
}
