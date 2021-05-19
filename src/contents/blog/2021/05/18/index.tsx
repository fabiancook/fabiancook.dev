import { Post } from "../../../post";
import { h } from "../../../../../h";

async function Content() {
  const { default: content } = await import("./content");
  return content;
}

export const ConcurrentUnions20210518 = (
  <Post title="Concurrent Unions" date="18th May 2021" path="/2021/05/18/concurrent-unions" summary="Creating a union of multiple async iterators">
    <Content />
  </Post>
);
