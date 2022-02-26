import { h } from "../h";
import { Intro } from "./intro";
import { OrderedPosts } from "./blog";
import { Template } from "../template";

export const SiteContents = (
  <div>
    {Intro}
    <Template id="posts">
      {OrderedPosts.filter((post) => !post.options.draft).map(async (post) => {
        return (
          <div class="post-item">
            <h2>
              <a href={post.options.path}>{post.options.title}</a>
            </h2>
            <p>
              <em>{post.options.date}</em>
            </p>
            <div class="quote">{post.options.summary}</div>
          </div>
        );
      })}
      <div hidden class="drafts">
        {OrderedPosts.filter((post) => post.options.draft).map(async (post) => {
          return <a href={post.options.path}>{post.options.title}</a>;
        })}
      </div>
    </Template>
  </div>
);
