import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'lib/transform.js',
    output: {
        dir: 'dist/',
        format: 'es'
    },
    plugins: [nodeResolve()]
}