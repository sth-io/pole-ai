import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default {
  input: './index.ts',
  output: {
    file: './dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};