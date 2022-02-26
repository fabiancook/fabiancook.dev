import { Post, Summary, Title } from "../../../post";
import { h } from "../../../../../h";

async function Content() {
  const { default: content } = await import("./content");
  return content;
}

export const ManyThings20210527 = (
  <Post
    title="Many Things"
    date="23rd May 2021"
    path="/2021/05/27/many-things"
    summary="Doing many things at once"
    draft
  >
    <h1>
      <Title>Many Things</Title>
    </h1>
    <p>
      <em>27th May 2021</em>
    </p>
    <div class="quote">
      <Summary>Doing many things at once</Summary>
    </div>
    <Content />
    <hr />
    <footer>
      <em>
        The source code for this blog post can be found at&nbsp;
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/fabiancook/fabiancook.dev/blob/main/src/contents/blog/2021/05/23/content.tsx"
        >
          github.com/fabiancook/fabiancook.dev
        </a>
      </em>
    </footer>
  </Post>
);
