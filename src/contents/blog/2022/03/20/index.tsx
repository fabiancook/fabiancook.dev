import { Post, Summary, Title } from "../../../post";
import { h } from "../../../../../h";

async function Content() {
  const { default: content } = await import("./content");
  return content;
}

export const JSX20220320 = (
  <Post
    title="JSX your way"
    date="20th March 2022"
    path="/2022/03/20/jsx-your-way"
    summary="Produce and consume JSX in any way that you want"
    draft
  >
    <h1>
      <Title>JSX your way</Title>
    </h1>
    <p>
      <em>20th March 2022</em>
    </p>
    <div class="quote">
      <Summary>Produce and consume JSX in any way that you want</Summary>
    </div>
    <Content />
    <hr />
    <footer>
      <em>
        The source code for this blog post can be found at&nbsp;
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/fabiancook/fabiancook.dev/blob/main/src/contents/blog/2022/03/18/content.tsx"
        >
          github.com/fabiancook/fabiancook.dev
        </a>
      </em>
    </footer>
  </Post>
);
