// Stub for @vercel/og - not used in this project
// This eliminates resvg.wasm (1.4MB) and yoga.wasm (87KB) from the worker bundle
export class ImageResponse extends Response {
  constructor() {
    super("OG Image generation is not available", { status: 500 });
  }
}
