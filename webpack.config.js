
module.exports = {
    entry: "./gui/index.js",
    target: "node",
    mode: "development",
    devtool: 'cheap-module-source-map',
    output: {
        path: __dirname + "/gui",
        filename: "dist.js"
    },
    externals: {
        settings: "settings"
    },
    resolve: {
        extensions: ['.ts', '.js']
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
