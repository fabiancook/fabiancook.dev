import { Post, Summary, Title } from "../../../post";
import { h } from "../../../../../h";

async function Content() {
  const { default: content } = await import("./content");
  return content;
}

export const ConcurrentUnions20210518 = (
  <Post
    title="Concurrent Unions"
    date="18th May 2021"
    path="/2021/05/18/concurrent-unions"
    summary="Creating a union of multiple async iterators"
  >
    <h1>
      <Title>Concurrent Unions</Title>
    </h1>
    <p>
      <em>18th May 2021</em>
    </p>
    <div class="quote">
      <Summary>
        Creating a union of multiple{" "}
        <a
          rel="noopener"
          href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator"
          target="_blank"
        >
          async iterators
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
          href="https://github.com/fabiancook/fabiancook.dev/blob/main/src/contents/blog/2021/05/18/content.tsx"
        >
          github.com/fabiancook/fabiancook.dev
        </a>
      </em>
    </footer>
  </Post>
);
