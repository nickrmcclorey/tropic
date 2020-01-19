
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
    },
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	}
}
