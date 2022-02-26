import { Post, Summary, Title } from "../../../post";
import { h } from "../../../../../h";

async function Content() {
  const { default: content } = await import("./content");
  return content;
}

export const AnAsyncThing20220226 = (
  <Post
    title="An Async Thing"
    date="26th Feb 2022"
    path="/2022/02/26/an-async-thing"
    summary="How to work with many async objects and functions"
  >
    <h1>
      <Title>An Async Thing</Title>
    </h1>
    <p>
      <em>26th Feb 2022</em>
    </p>
    <div class="quote">
      <Summary>How to work with many async objects and functions</Summary>
    </div>
    <Content />
    <hr />
    <footer>
      <em>
        The source code for this blog post can be found at&nbsp;
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/fabiancook/fabiancook.dev/blob/main/src/contents/blog/2022/02/26/content.tsx"
        >
          github.com/fabiancook/fabiancook.dev
        </a>
      </em>
    </footer>
  </Post>
);
