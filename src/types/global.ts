declare global {

  interface Window {
    proposalSiteRender?: Promise<void>;
    postSiteRender?: Promise<void>;
  }

}

export {};
