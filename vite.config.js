import vue from '@vitejs/plugin-vue'
import { join } from 'path'

function resolve(dir) {
    return join(__dirname, dir);
}

export default {
    base: './',
    plugins: [vue()],
    optimizeDeps: {
        include: ['schart.js']
    },
    resolve: {
        alias: {
            '@': resolve('src')
        }
    }
}