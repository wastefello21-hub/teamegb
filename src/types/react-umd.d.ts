// Provide a UMD-style global `React` type for generated Next.js validator types
declare global {
  // Provide a lightweight global `React` namespace with common types to
  // satisfy generated validator code. Types are intentionally permissive.
  namespace React {
    type ComponentType<P = any> = any;
    type FC<P = any> = any;
    type ReactNode = any;
    type JSXElementConstructor<P = any> = any;
    type PropsWithChildren<P> = any;
  }
}

export {};
