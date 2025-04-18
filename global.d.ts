// global.d.ts
import { Request as NodeRequest } from 'node-fetch';
import * as buffer from 'buffer';

// Define enhanced interface types
interface EnhancedHeaders extends Headers {
  getSetCookie(): string[];
}

interface EnhancedResponse extends Response {
  bytes(): Promise<Uint8Array>;
  buffer(): Promise<buffer.Buffer>;
  size: number;
  textConverted(): Promise<string>;
  timeout: number;
  headers: EnhancedHeaders;
}

declare global {
  // Use our enhanced type definitions
  var Request: typeof NodeRequest;
  var Response: {
    new (body?: BodyInit | null, init?: ResponseInit): EnhancedResponse;
    prototype: EnhancedResponse;
    json(data: any, init?: ResponseInit): EnhancedResponse;
    error(): EnhancedResponse;
    redirect(url: string | URL, status?: number): EnhancedResponse;
  };
  var Headers: {
    new (init?: HeadersInit): EnhancedHeaders;
    prototype: EnhancedHeaders;
  };

  // Text encoding utilities
  var TextEncoder: TextEncoder;
  var TextDecoder: TextDecoder;
}

// This export is needed to make this a module
export {};
