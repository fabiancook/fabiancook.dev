import { h } from "../../../../../h";
import { createFragment } from "@virtualstate/x";
import { union } from "@virtualstate/union";
import {
  allSettledGenerator,
  allSettled,
} from "@virtualstate/promise/all-settled";
import { allGenerator, all } from "@virtualstate/promise/all";
import { anAsyncThing } from "@virtualstate/promise/the-thing";
import { name, properties, children } from "@virtualstate/focus";

export default (
  <section>
    <br />
    <p>
        I have a vision to be able to write and read JSX trees in a way that is JavaScript flavoured
    </p>
      <p>
          JSX trees have two kinds of information available about them.
      </p>
      <p>
          The first kind is information that is readily available and accessible directly on the top referenced JSX node.<br/>
          For example the name or type of the node, this is usually a string for known types, or a function for
          nodes that have resolvable information related to them.<br/>
          Another example is the properties provided to the JSX node when it was defined.
      </p>
      <p>
          In JavaScript, we can define "getter" functions that
          take an object, and returns the relevant value.
      </p>
      <p>
          The thing is, different implementations of JSX use different object shapes and property names.
      </p>
      <p>
          That's okay, we will just read every key and use the first one that matches!
      </p>
      <p>
          This lead to the implementation of <span class="code">name</span>, and <span class="code">properties</span>
      </p>
      <pre>
          {`
const { name, properties } = await import("@virtualstate/focus");
`.trim()}
      </pre>
      <p>
          Give any object to these functions, and they will go through a list of known property names, and return the value
      </p>
      <pre>
          {`
console.log(name({ name: "some name" }));
console.log(name({ tagName: "some name" }));
console.log(name({ source: "some name" }));
console.log(name({ type: "some name" }));
console.log(name({ [Symbol.for(":jsx/type")]: "some name" }));
`.trim()}
      </pre>
      <pre>
          {`
console.log(properties({ properties: { key: "value" } }));
console.log(properties({ props: { key: "value" } }));
console.log(properties({ options: { key: "value" } }));
console.log(properties({ [Symbol.for(":jsx/properties")]: { key: "value" } }));
console.log(properties({ [Symbol.for(":jsx/props")]: { key: "value" } }));
console.log(properties({ [Symbol.for(":jsx/options")]: { key: "value" } }));
`.trim()}
      </pre>
      <p>
          The above would log
      </p>
      <pre>
          {`
some name
some name
some name
some name
some name
{ key: 'value' }
{ key: 'value' }
{ key: 'value' }
{ key: 'value' }
{ key: 'value' }
`.trim()}
      </pre>
      <p>
          This opens up the pattern of allowing some intermediate function providing a layer between our defined
          JSX objects, and
      </p>
      <p>
          The second kind is information that is not readily available, and requires resolution.<br />
          For example children that resolve their state, either asynchronously or not.
      </p>
      <p>
          Following the same pattern used for <span class="code">name</span> we can define a&nbsp;
          <span class="children">children</span> function that gives us the same kind of access.
      </p>
      <pre>
          {`
const { children } = await import("@virtualstate/focus");
`.trim()}
      </pre>
      <pre>
          {`
async function Wait({ tasks }, input) {
  while (tasks -= 1) {
    await new Promise(queueMicrotask);
  }
  return input;
}
const node = (
  <parent>
    <Wait tasks={10}>10</Wait>
    <Wait tasks={20}>20</Wait>
    <Wait tasks={30}>30</Wait>
  </parent>
);
console.log(await children(node));
`.trim()}
      </pre>
      <p>
          The above would log
      </p>
      <pre>
          {`
[10, 20, 30]
`.trim()}
      </pre>
      <p>
          In this case it could take any number of steps to complete resolution.
          Using <a href="/2022/02/26/an-async-thing" target="_blank">an async thing</a>&nbsp;
          we can provide a unified object that can be used with both <span className="code">await</span> and&nbsp;
          <span className="code">for await</span>, providing a way for consuming code to look at children as a whole,
          or seeing the progression of resolution through each set of updates.
      </p>
      <pre>
          {`
for await (const snapshot of children(node)) {
    console.log(snapshot);
}
`.trim()}
      </pre>
      <p>
          The above would log
      </p>
      <pre>
          {`
[10]
[10, 20]
[10, 20, 30]
`.trim()}
      </pre>
      <p>
          Using <span className="code">for await</span>, without knowing whats happening internal to the JSX node,
          we can iterate each time we receive a snapshot of the known children state, with the final iteration being
          equivalent to the original <span className="code">await</span> based code.
      </p>
      <p>
          Given that we have a way to watch multiple updates for the same child, meaning children
          can be async generator functions.
      </p>
      <pre>
          {`
async function *Tasks({ tasks }, input) {
    yield "Starting";
    while (tasks -= 1) {
        await task();
        yield \`Remaining tasks \${tasks}\`;
    }
    yield input;
}

const node = (
    <parent>
        <Tasks tasks={3}>Done</Tasks>
    </parent>
);

for await (const snapshot of children(node)) {
    console.log(snapshot);
}
`.trim()}
      </pre>
      <p>
          The above would log
      </p>
      <pre>
          {`
["Starting"]
["Remaining tasks 2"]
["Remaining tasks 1"]
["Done"]
`.trim()}
      </pre>
      <p>
          Multiple children can produce multiple states at the same time, if two children resolve within the same
          microtask, you most likely will see their results in the same iteration. Either way, going back
          to just using <span class="code">await</span> shows the complete resolution:
      </p>
      <pre>
          {`
const node = (
    <parent>
        <Tasks tasks={9}>Done 1</Tasks>
        <Tasks tasks={1}>Done 2</Tasks>
        <Tasks tasks={7}>Done 3</Tasks>
    </parent>
);

console.log(await children(node));
`.trim()}
      </pre>
      <p>
          Would log
      </p>
      <pre>
          {`
["Done 1", "Done 2", "Done 3"]
`.trim()}
      </pre>
      <p>
          Given that each JSX node can optionally have resolvable children, a tree of descendants can be resolved
          by stepping through each child (and so on) to produce a full representation of the entire available state.
          This is another example of the second kind of information that we want to read from a JSX tree.
      </p>
    <Examples />
    <p>
      The resulting repository & module used in this post can be found at{" "}
      <a
        href="https://github.com/virtualstate/focus"
        target="_blank"
        rel="noopener"
      >
        github.com/virtualstate/focus
      </a>
    </p>
  </section>
);

async function Examples() {
  return (
    <>
        <script type="application/json" hidden id="names">
            {JSON.stringify(await names(), undefined, "  ")}
        </script>
        <script type="application/json" hidden id="props">
            {JSON.stringify(await props(), undefined, "  ")}
        </script>
        <script type="application/json" hidden id="childrenWait">
            {JSON.stringify(await childrenWait(), undefined, "  ")}
        </script>
        <script type="application/json" hidden id="childrenWaitForAwait">
            {JSON.stringify(await childrenWaitForAwait(), undefined, "  ")}
        </script>
        <script type="application/json" hidden id="childrenWaitForAwaitTasks">
            {JSON.stringify(await childrenWaitForAwaitTasks(), undefined, "  ")}
        </script>
        <script type="application/json" hidden id="childrenWaitForAwaitTasks2">
            {JSON.stringify(await childrenWaitForAwaitTasks2(), undefined, "  ")}
        </script>
        <script type="application/json" hidden id="childrenWaitAwaitTasks">
            {JSON.stringify(await childrenWaitAwaitTasks(), undefined, "  ")}
        </script>
    </>
  );
}

function createLog() {
    const result: unknown[] = [];
    return {
        log(...message: unknown[]) {
            result.push(message);
            console.log(...message);
        },
        get result() {
            return result;
        }
    }
}


async function names() {
    const console = createLog();

    console.log(name({ name: "some name" }));
    console.log(name({ tagName: "some name" }));
    console.log(name({ source: "some name" }));
    console.log(name({ type: "some name" }));
    console.log(name({ [Symbol.for(":jsx/type")]: "some name" }));

    return console.result;
}

async function props() {
    const console = createLog();

    console.log(properties({ properties: { key: "value" } }));
    console.log(properties({ props: { key: "value" } }));
    console.log(properties({ options: { key: "value" } }));
    console.log(properties({ [Symbol.for(":jsx/properties")]: { key: "value" } }));
    console.log(properties({ [Symbol.for(":jsx/props")]: { key: "value" } }));
    console.log(properties({ [Symbol.for(":jsx/options")]: { key: "value" } }));

    return console.result;
}

async function Wait({ tasks }: { tasks: number }, input?: unknown) {
    while (tasks -= 1) {
        await new Promise<void>(queueMicrotask);
    }
    return input;
}

const node = (
    <parent>
        <Wait tasks={10}>10</Wait>
        <Wait tasks={20}>20</Wait>
        <Wait tasks={30}>30</Wait>
    </parent>
);
async function childrenWait() {
    const console = createLog();

    console.log(await children(node));

    return console.result;
}

async function childrenWaitForAwait() {
    const console = createLog();

    for await (const snapshot of children(node)) {
        console.log(snapshot);
    }

    return console.result;
}

async function task() {
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
}

async function *Tasks({ tasks }: { tasks: number }, input?: unknown) {
    yield "Starting";
    while (tasks -= 1) {
        await task();
        yield `Remaining tasks ${tasks}`;
    }
    yield input;
}

async function childrenWaitForAwaitTasks() {
    const console = createLog();

    const node = (
        <parent>
            <Tasks tasks={3}>Done</Tasks>
        </parent>
    );

    for await (const snapshot of children(node)) {
        console.log(snapshot);
    }

    return console.result;
}

async function childrenWaitForAwaitTasks2() {
    const console = createLog();

    const node = (
        <parent>
            <Tasks tasks={3}>Done 1</Tasks>
            <Tasks tasks={3}>Done 2</Tasks>
            <Tasks tasks={3}>Done 3</Tasks>
        </parent>
    );

    for await (const snapshot of children(node)) {
        console.log(snapshot);
    }

    return console.result;
}

async function childrenWaitAwaitTasks() {
    const console = createLog();

    const node = (
        <parent>
            <Tasks tasks={9}>Done 1</Tasks>
            <Tasks tasks={1}>Done 2</Tasks>
            <Tasks tasks={7}>Done 3</Tasks>
        </parent>
    );

    console.log(await children(node));

    return console.result;
}