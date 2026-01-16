import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.dedupe = ['react', 'react-dom'];
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '..', 'src'),
    };
    return config;
  },
};

export default config;
