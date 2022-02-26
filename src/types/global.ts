declare global {
  interface Window {
    siteRender?: Promise<void>;
    operation?(symbol: symbol): Promise<void>;
    scale?: number;
    scaleWidth?: number;
    scaleBigInt?: bigint;
    scaleWidthBigInt?: bigint;
  }
}

export {};
