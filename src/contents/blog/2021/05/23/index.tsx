import { Post, Summary, Title } from "../../../post";
import { h } from "../../../../../h";

async function Content() {
  const { default: content } = await import("./content");
  return content;
}

export const Rendering20210523 = (
  <Post
    title="Rendering"
    date="23rd May 2021"
    path="/2021/05/23/rendering"
    summary="Rendering with @virtualstate/x"
  >
    <h1>
      <Title>Rendering</Title>
    </h1>
    <p>
      <em>23rd May 2021</em>
    </p>
    <div class="quote">
      <Summary>
        Rendering with{" "}
        <a
          rel="noopener"
          href="https://github.com/virtualstate/x"
          target="_blank"
        >
          @virtualstate/x
        </a>
      </Summary>
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
