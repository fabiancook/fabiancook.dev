import { h } from "../h";
import { Intro } from "./intro";
import * as Posts from "./blog";
import { Template } from '../template';
import { createFragment } from '@virtualstate/x';
import { assertPostTokens, Post, PostToken } from './blog/post';

const allPosts = Object.keys(Posts)
  .filter((key: string): key is keyof typeof Posts => Object.prototype.hasOwnProperty.call(Posts, key))
  .map((key) => Posts[key])
  .filter((post): post is PostToken => Post.is(post));

export const SiteContents = (
  <>
    <div>
      {Intro}
      <Template id="posts">
        {
          allPosts.map(async post => {
            return (
              <div class="post-item">
                <h2><a href={post.options.path}>{post.options.title}</a></h2>
                <p>
                  <em>{post.options.date}</em>
                </p>
                <div class="quote">
                  {post.options.summary}
                </div>
              </div>
            )
          })
        }
      </Template>
    </div>
  </>
);
