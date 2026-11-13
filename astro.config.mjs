import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yegroup.cuhk.edu.cn',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});
