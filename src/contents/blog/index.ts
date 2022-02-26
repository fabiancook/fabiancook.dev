import { Post, PostToken } from "./post";
import * as PostsFrom2021 from "./2021";
import * as PostsFrom2022 from "./2022";

export * from "./2021";
export * from "./2022";

const BaseNamedPosts = {
  ...PostsFrom2021,
  ...PostsFrom2022,
};
export const NamedPosts: Record<keyof typeof BaseNamedPosts, PostToken> = {
  ...BaseNamedPosts,
};

export const Posts: PostToken[] = Object.keys(NamedPosts)
  .filter((key: string): key is keyof typeof NamedPosts =>
    Object.prototype.hasOwnProperty.call(NamedPosts, key)
  )
  .map((key) => NamedPosts[key])
  .filter((post): post is PostToken => Post.is(post));

export const OrderedPosts: PostToken[] = Posts.sort(
  (a: PostToken, b: PostToken) => {
    if (!a.options.path || !b.options.path) {
      return 1;
    }
    return a.options.path > b.options.path ? -1 : 1;
  }
);
