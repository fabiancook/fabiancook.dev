declare global {

  interface Window {
    siteRender?: Promise<void>;
    operation?(symbol: symbol): Promise<void>;
  }

}

export {};
