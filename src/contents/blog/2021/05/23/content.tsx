import { h } from "../../../../../h";
import { h as f, VNode } from "@virtualstate/x";

export default (
  <section>
    <br />
    <div class="quote">
      <em>
        This is a blog post that I will be extending over time and used as a
        staging grounds for <span class="code">@virtualstate/x</span>'s README
        file
      </em>
      <br />
      <br />
      <em>
        Pssst... Checkout the hidden divs by using your browsers developer tools
      </em>
    </div>
    <p>
      Scalar nodes created with <span class="code">h</span> can be read directly
    </p>
    <pre class="code">
      {`
import { h } from "@virtualstate/x";

const node = h(1);
const { source: one } = node;
console.log({ one }); // Logs { one: 1 }
`.trim()}
    </pre>
    <div hidden>
      <One />
    </div>
    <p>
      Any nodes with <span class="code">h</span> that have children can be read
      using <span class="code">for await</span>
    </p>
    <pre class="code">
      {`
const first = h("first");
const second = h("second");
const third = h("third");
const node = h("result", {}, first, second, third);

const { source: result, children } = node;
console.log({ result }); // Logs { result: "result" }

if (!children) throw new Error("Expected children");

for await (const results of children) {
  // Eventually Logs { results: ["first", "second", "third" ] }
  console.log({ results: results.map(node => node.source) });
}
`.trim()}
    </pre>
    <div hidden>
      <Children />
    </div>
    <p>Any function type can be used as a virtual node</p>
    <pre>
      {`
import { h } from "@virtualstate/x";

function Fn() {
  return "Function ✨";
}
async function AsyncFn() {
  await new Promise<void>(queueMicrotask);
  return "Async Function 💡";
}
function *GeneratorFn() {
  yield "GeneratorFn Loading";
  yield "GeneratorFn 💥";
}
async function *AsyncGeneratorFn() {
  yield "AsyncGeneratorFn Loading";
  yield "AsyncGeneratorFn 🔥";
}
function Fns() {
  return [
    h(Fn),
    h(AsyncFn),
    h(GeneratorFn),
    h(AsyncGeneratorFn)
  ]
    .map(node => f("fn", { name: node.source.name }, node.source.name, node));
}

const { children } = f(Fns);

if (!children) throw new Error("Expected children");

for await (const results of children) {
  // Eventually Logs { results: ["Fn", "AsyncFn", "GeneratorFn", "AsyncGeneratorFn" ] }
  console.log({ results: results.map(node => node.options.name) });
}
      `.trim()}
    </pre>
    <div hidden>
      <Functions />
    </div>
  </section>
);

function One() {
  const node = f(1);
  const { source: one } = node;
  console.log({ one });
  return JSON.stringify({ one }, undefined, "  ");
}

async function Children() {
  const first = h("first");
  const second = h("second");
  const third = h("third");
  const node = h("result", {}, first, second, third);

  const { source: result, children } = node;
  console.log({ result }); // Logs { result: "result" }

  if (!children) throw new Error("Expected children");

  for await (const results of children) {
    // Eventually Logs { results: ["first", "second", "third" ] }
    console.log({ results: results.map((node) => node.source) });
  }
  return node;
}

async function* Functions() {
  function Fn() {
    return "Function ✨";
  }
  async function AsyncFn() {
    await new Promise<void>(queueMicrotask);
    return "Async Function 💡";
  }
  function* GeneratorFn() {
    yield "GeneratorFn Loading";
    yield "GeneratorFn 💥";
  }
  async function* AsyncGeneratorFn() {
    yield "AsyncGeneratorFn Loading";
    yield "AsyncGeneratorFn 🔥";
  }
  function Fns() {
    return [h(Fn), h(AsyncFn), h(GeneratorFn), h(AsyncGeneratorFn)]
      .filter(
        (node: VNode): node is VNode & { source: Function } =>
          typeof node.source === "function"
      )
      .map((node) =>
        f("fn", { name: node.source.name }, node.source.name, node)
      );
  }

  const { children } = f(Fns);

  if (!children) throw new Error("Expected children");

  for await (const results of children) {
    // Eventually Logs { results: ["Fn", "AsyncFn", "GeneratorFn", "AsyncGeneratorFn" ] }
    console.log({
      results: results.map((node) => {
        assertRecord(node.options);
        return node.options.name;
      }),
    });
    yield results;
  }
}

function assertRecord(
  value?: object
): asserts value is Record<string, unknown> {
  if (!value) {
    throw new Error("Expected record");
  }
}
