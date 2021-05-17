import { h } from "../h";
import { Intro } from "./intro";
import * as Posts from "./blog";
import { Template } from '../template';

const posts = Object.keys(Posts)
  .filter((key: string): key is keyof typeof Posts => Object.prototype.hasOwnProperty.call(Posts, key))
  .map((key) => Posts[key]);

export const SiteContents = (
  <main>
    {Intro}
    <Template id="posts">
      {posts}
    </Template>
  </main>
);
