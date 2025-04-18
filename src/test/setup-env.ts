import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
import * as nodeFetch from 'node-fetch';

// Polyfill fetch for Node.js environment
global.fetch = nodeFetch as unknown as typeof fetch;

// Only apply polyfills if they don't exist
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = NodeTextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-expect-error - Node's TextDecoder is slightly different from the browser's
  globalThis.TextDecoder = NodeTextDecoder;
}

// Mock global web APIs with node-fetch implementations
import { mockWebAPIs } from './mocks/next-server';
mockWebAPIs();

// Configure mocks for external dependencies
import './mocks';
