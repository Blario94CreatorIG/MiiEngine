// Load the exact Three.js build used by MiiEngine before its native renderer bundle.
globalThis.THREE = (await import("/dist/three.js")).default;
await import("/dist/sandbox-renderer.js");
await globalThis.MiiSandboxNative.init();
await import("/sandbox.js");
