import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import alias from '@rollup/plugin-alias';
import Pages from 'vite-plugin-pages';
import Layouts from 'vite-plugin-vue-layouts';
import fs from 'fs';

const projectRootDir = resolve(__dirname);

export default ({ command, mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        plugins: [
            vue(),
            Pages({
                dirs: 'src/pages',
                extensions: ['vue'],
                exclude: ['**/components/*.vue'],
            }),
            Layouts(),
            Components({
                directoryAsNamespace: true,
                dts: 'components.d.ts',
                dirs: ['src/components'],
            }),
            alias(),
        ],

        server: {
            port: 4443,
            host: true,
            strictPort: true,
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:4444',
                    changeOrigin: true,
                },
            },
            https: {
                key: fs.readFileSync('./key.pem'),
                cert: fs.readFileSync('./cert.pem'),
            },
        },

        resolve: {
            alias: {
                '@components': resolve(projectRootDir, 'src/components'),
                '@composables': resolve(projectRootDir, 'src/composables'),
                '@server': resolve(projectRootDir, '../server/src'),
            },
        },

        publicDir: 'public',
    });
};
