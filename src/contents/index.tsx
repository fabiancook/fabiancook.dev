import { h } from "../h";
import { Intro } from "./intro";
import * as Posts from "./blog";
import { Template } from '../template';
import { createFragment } from '@opennetwork/vnode';

const posts = Object.keys(Posts)
  .filter((key: string): key is keyof typeof Posts => Object.prototype.hasOwnProperty.call(Posts, key))
  .map((key) => Posts[key]);

export const SiteContents = (
  <>
    <main>
      {Intro}
      <Template id="posts">
        {posts}
      </Template>
      <footer>
        <h4>Licence</h4>
        <p>
          This website and <a href="https://github.com/fabiancook/fabiancook.dev" target="_blank" rel="noopener noreferrer">associated GitHub respository</a> is licensed under the <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">CC0 1.0 Universal</a> license.
        </p>
      </footer>
    </main>
  </>
);
