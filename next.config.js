const CopyPlugin = require("copy-webpack-plugin");

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, {}) => {
    config.resolve.extensions.push(".ts", ".tsx", '.js', '.jsx')
    config.resolve.fallback = { fs: false }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
            to: "static/chunks/[name][ext]",
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
            to: "static/chunks/[name][ext]",
          },
          // {
          //   from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
          //   to: "static/chunks/[name][ext]",
          // },
          // {
          //   from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
          //   to: "static/chunks/[name][ext]",
          // },
        ],
      })
    )
    return config
  },
});
