declare global {

  interface Window {
    siteRender?: Promise<void>;
  }

}

export {};
