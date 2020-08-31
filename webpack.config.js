module.exports = {
    mode: "production",
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry : __dirname + "/application/static/reactjs/src/index.js",
    output: {
        path: __dirname + "/application/static/reactjs/js",
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                loader: "json"
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015", "react", "stage-0", "env"],
                    plugins: ["babel-plugin-transform-class-properties"]
                }
            },
            {
                test: /\.css$/,
                loader: 'style!css?modules'
            }
        ]
    }


};
