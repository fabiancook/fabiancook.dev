import { createToken, TokenVNodeFn, TokenVNodeBase, VNode } from '@opennetwork/vnode';

export interface PostOptions {
  path: string;
}
export const PostSymbol = Symbol("Post");
export type PostToken = TokenVNodeBase<typeof PostSymbol, PostOptions>;
export type PostTokenFn = TokenVNodeFn<typeof PostSymbol, PostOptions>;
export const Post: PostTokenFn = createToken(PostSymbol);

export function assertPostTokens(nodes: VNode[]): asserts nodes is PostToken[] {
  for (const node of nodes) {
    Post.assert(node);
  }
}

export interface TitleOptions {
}
export const TitleSymbol = Symbol("Title");
export type TitleToken = TokenVNodeBase<typeof TitleSymbol, TitleOptions>;
export type TitleTokenFn = TokenVNodeFn<typeof TitleSymbol, TitleOptions>;
export const Title: TitleTokenFn = createToken(TitleSymbol);

export async function title(post: PostToken) {

}

export interface SummaryOptions {
}
export const SummarySymbol = Symbol("Summary");
export type SummaryToken = TokenVNodeBase<typeof SummarySymbol, SummaryOptions>;
export type SummaryTokenFn = TokenVNodeFn<typeof SummarySymbol, SummaryOptions>;
export const Summary: SummaryTokenFn = createToken(SummarySymbol);

export async function summary(post: PostToken) {

}
