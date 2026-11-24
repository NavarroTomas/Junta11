const path = require('node:path');
const { webpack, DefinePlugin } = require('next/dist/compiled/webpack/webpack-lib');
const config = require('../src/platform/public-config.json');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const platform = path.join(source, 'platform');

if (config.NEXT_PUBLIC_SUPABASE_URL !== 'https://ilkkqynzvwskpwjgtapi.supabase.co') {
  throw new Error('Unexpected Supabase project URL');
}
if (!config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
  throw new Error('Missing browser publishable key');
}

const publicKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];
const definitions = Object.fromEntries(
  publicKeys.map(key => ['process.env.' + key, JSON.stringify(config[key] || '')]),
);

webpack({
  mode: 'production',
  context: root,
  entry: path.join(platform, 'entry.tsx'),
  target: 'web',
  devtool: false,
  output: {
    path: path.join(root, 'public/junta11'),
    filename: 'platform.js',
    chunkFilename: 'platform-[contenthash].js',
    publicPath: '/junta11/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': source,
      'next/link': path.join(platform, 'router.tsx'),
      'next/navigation': path.join(platform, 'router.tsx'),
      'next/image': path.join(platform, 'image.tsx'),
    },
  },
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, use: path.join(__dirname, 'platform-loader.cjs') },
      { test: /\.css$/, use: path.join(__dirname, 'platform-css-loader.cjs') },
    ],
  },
  plugins: [new DefinePlugin(definitions)],
  optimization: { minimize: false },
  performance: { hints: false },
}, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
    return;
  }
  console.log(stats.toString({ all: false, assets: true, warnings: true }));
});
