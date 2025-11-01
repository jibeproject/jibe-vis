import { vi } from 'vitest';

vi.mock('maplibre-gl', () => ({
  default: {
    addProtocol: vi.fn(),
    removeProtocol: vi.fn(),
    Map: vi.fn(),
    Popup: vi.fn(),
    LngLatBounds: vi.fn(),
    // Add other classes/functions you use as needed
  },
  Map: vi.fn(),
  Popup: vi.fn(),
  LngLatBounds: vi.fn(),
  // Add other named exports if needed
}));

vi.mock('@watergis/maplibre-gl-export', () => ({
  MaplibreExportControl: vi.fn(),
  Size: { A3: 'A3' }, 
  PageOrientation: { Landscape: 'Landscape' },
  Format: { PNG: 'PNG' },
  DPI: { 96: 96 },
}));

vi.mock('prop-types', () => ({
  shape: vi.fn(),
  number: vi.fn(),
  // ...other PropTypes as needed
}));

// filepath: d:\projects\jibe-vis\app\setupTests.ts
// @ts-ignore
global.Blob = window.Blob;

// Polyfill/mocks for DOM APIs used by third-party libs during tests.
// maplibre-gl expects window.URL.createObjectURL to exist; Jest's JSDOM
// may not implement it. Provide a minimal stub so imports succeed.
if (typeof window !== 'undefined' && (window as any).URL && !(window as any).URL.createObjectURL) {
	(window as any).URL.createObjectURL = function () {
		// return a harmless string; some libs only check for presence
		// or use the returned value as a URI for worker scripts.
		return 'blob:mock';
	};
}

// Ensure TextEncoder is present in the test environment (some libs rely on it).
// Use Node's util.TextEncoder when available.
try {
	if (typeof (globalThis as any).TextEncoder === 'undefined') {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { TextEncoder } = require('util');
		(globalThis as any).TextEncoder = TextEncoder;
	}
} catch (e) {
	// ignore if require isn't available in this environment
}

// Minimal stub for canvas getContext to satisfy libraries (jspdf, maplibre-export).
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
	// Provide a no-op 2D context with minimal methods used by dependencies.
	// Some libs only check for existence; this prevents "Not implemented" errors.
	// @ts-ignore
	HTMLCanvasElement.prototype.getContext = function () {
		return {
			getContextAttributes: () => ({}),
			fillRect: () => {},
			clearRect: () => {},
			getImageData: () => ({ data: [] }),
			putImageData: () => {},
			createImageData: () => [],
			setTransform: () => {},
			drawImage: () => {},
			save: () => {},
			restore: () => {},
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			closePath: () => {},
			stroke: () => {},
			fillText: () => {},
			measureText: () => ({ width: 0 }),
			transform: () => {},
			scale: () => {},
			rotate: () => {},
			translate: () => {},
			arc: () => {},
			fill: () => {},
		};
	};
}

window.scrollTo = () => {};