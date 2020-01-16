module.exports = {
    entry: "./gui/index.js",
    target: "node",
    mode: "production",
    output: {
        path: __dirname + "/gui",
        filename: "dist.js"
    },
}