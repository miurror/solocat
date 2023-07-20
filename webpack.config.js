const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {'@': path.resolve(__dirname, 'src')},
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
            {
                test: /\.mp3$/,
                type: "asset/resource",
                generator: {
                    filename: "assets/audio/[name][ext]"
                },
            },
            {
                test: /\.svg$/,
                type: "asset",
                // parser: { dataUrlCondition: { maxSize:15000 } }, 
                generator: {
                    filename: "assets/[name][ext]"
                }
            },
        ],
    },
    devServer: {
        hot: true,
        open: false,
        static: path.resolve(__dirname, "dist"),
    },
};