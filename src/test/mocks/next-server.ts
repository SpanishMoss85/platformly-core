// src/test/mocks/next-server.ts
// @ts-nocheck - Web API mocks have intentional type incompatibilities
import { Request as NodeRequest, Response as NodeResponse, Headers as NodeHeaders } from 'node-fetch';

// Create an enhanced Headers class with the missing methods
class EnhancedHeaders extends NodeHeaders {
  // Add getSetCookie method that's required by your project
  getSetCookie(): string[] {
    // Implementation depends on your needs, here's a simple one
    const setCookieHeader = this.get('set-cookie');
    if (!setCookieHeader) return [];
    return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  }
}

// Create an enhanced Response class with all required properties and methods
class EnhancedResponse extends NodeResponse {
  // Add missing properties
  buffer: () => Promise<Buffer> = () => this.arrayBuffer().then((arr) => Buffer.from(arr));
  size: number = 0;
  textConverted: () => Promise<string> = () => this.text();
  timeout: number = 0;

  // Add bytes and formData methods
  bytes(): Promise<Uint8Array> {
    return this.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }

  formData(): Promise<FormData> {
    return Promise.resolve(new FormData());
  }

  // Override headers getter to return our enhanced headers
  get headers(): EnhancedHeaders {
    return new EnhancedHeaders(super.headers);
  }

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);

    // Initialize additional properties if needed
    if (init && typeof init === 'object') {
      if ('size' in init) this.size = (init as any).size;
      if ('timeout' in init) this.timeout = (init as any).timeout;
    }
  }
}

// Add static methods to the enhanced Response class
EnhancedResponse.json = function (data: any, init?: ResponseInit): Response {
  const jsonString = JSON.stringify(data);
  return new EnhancedResponse(jsonString, {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  });
};

EnhancedResponse.error = function (): Response {
  return new EnhancedResponse(null, { status: 500 });
};

EnhancedResponse.redirect = function (url: string | URL, status = 302): Response {
  return new EnhancedResponse(null, {
    status,
    headers: { Location: url.toString() },
  });
};

export function mockWebAPIs() {
  // Only mock if not already defined
  if (typeof globalThis.Request === 'undefined') {
    // Assign with type assertions
    globalThis.Request = NodeRequest as unknown as typeof Request;
    globalThis.Response = EnhancedResponse as unknown as typeof Response;
    globalThis.Headers = EnhancedHeaders as unknown as typeof Headers;
  }
}
