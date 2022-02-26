import { render } from "./render";

window.siteRender = render();
window.siteRender.catch((error) => {
  throw error;
});
