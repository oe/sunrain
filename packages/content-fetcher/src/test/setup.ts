/**
 * Test setup file for vitest
 */

import { vi } from 'vitest';

// Mock DOM APIs that are not available in Node.js
global.document = {
  createElement: vi.fn((tag) => {
    if (tag === 'canvas') {
      return {
        getContext: vi.fn(() => ({
          scale: vi.fn(),
          fillStyle: '',
          fillRect: vi.fn(),
          drawImage: vi.fn(),
          font: '',
          fillText: vi.fn(),
          measureText: vi.fn(() => ({ width: 100 })),
          textAlign: 'left',
          textBaseline: 'top',
          globalAlpha: 1,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          shadowColor: 'transparent',
          strokeStyle: '',
          lineWidth: 1,
          setLineDash: vi.fn(),
          strokeRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          quadraticCurveTo: vi.fn(),
          closePath: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          clip: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn()
        })),
        width: 1080,
        height: 1080,
        toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
      };
    }
    if (tag === 'div') {
      return { textContent: '', innerHTML: '' };
    }
    return {};
  }),
  referrer: 'https://example.com'
} as any;

global.navigator = {
  userAgent: 'Test User Agent',
  share: vi.fn()
} as any;

global.window = {
  open: vi.fn(),
  setInterval: vi.fn((fn, delay) => {
    return setTimeout(fn, delay);
  }),
  clearInterval: vi.fn(clearTimeout),
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
} as any;

global.localStorage = global.window.localStorage;

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
} as any;
