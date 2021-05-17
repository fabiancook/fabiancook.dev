import { h } from "../h";
import { Intro } from "./intro";
import * as Posts from "./blog";

const posts = Object.keys(Posts)
  .filter((key: string): key is keyof typeof Posts => Object.prototype.hasOwnProperty.call(Posts, key))
  .map((key) => Posts[key]);

export const SiteContents = (
  <main>
    {Intro}
    {posts}
  </main>
);
