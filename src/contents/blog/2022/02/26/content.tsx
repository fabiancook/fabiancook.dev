import { h } from "../../../../../h";
import { createFragment } from "@virtualstate/x";
import { union } from "@virtualstate/union";
import {
  allSettledGenerator,
  allSettled,
} from "@virtualstate/promise/all-settled";
import { allGenerator, all } from "@virtualstate/promise/all";
import { anAsyncThing } from "@virtualstate/promise/the-thing";

export default (
  <section>
    <br />
    <p>
      Following the implementation of{" "}
      <a href="/2021/05/18/concurrent-unions">union</a> I have found working
      with many async generators as a group has been helpful, but not as close
      to what I would expect the large majority of JavaScript developers want.
    </p>
    <p>
      A good amount of async work can be done with individual promises without
      ever touching generators.
    </p>
    <p>
      As part of JavaScript, we have&nbsp;
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
        target="_blank"
        rel="noopener"
      >
        Promise.all
      </a>
      &nbsp;available.
    </p>
    <p>
      Using this function we can take a group of promises, and do something once
      they have all have fulfilled values
    </p>
    <p>
      Using&nbsp;
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled"
        target="_blank"
        rel="noopener"
      >
        Promise.allSettled
      </a>
      &nbsp;we can also inspect the individual status of each promise, without
      needing to use catch
    </p>
    <p>
      Both of these functions return a promise of the final state, in all's
      case, this promise will be rejected if at least one input promise
      rejected.
    </p>
    <p>
      This is helpful where you care about the group of promises as a single
      piece of information, however if you're looking to know about each status
      as it happens, you're a bit out of luck with your standard tools
    </p>
    <p>
      Using previously the mentioned{" "}
      <a href="/2021/05/18/concurrent-unions">union</a> function, if we were to
      wrap each of our promises with an async generator we could however capture
      these statuses as they are available
    </p>
    <pre>
      {`
const promises = [
  Promise.resolve(1),
  Promise.resolve(2),
  new Promise((resolve) => setTimeout(resolve, 10, 3)),
];

for await (const results of union(
  promises.map(async function* (promise) {
    try {
      yield { value: await promise, status: "fulfilled" };
    } catch (reason) {
      yield { reason, status: "rejected" };
    }
  }),
)) {
  console.log({ results });
}
`.trim()}
    </pre>
    <p>
      Using this pattern, we can create a generic generator that exposes this
      functionality for all promises
    </p>
    <pre>
      {`
import { allSettledGenerator } from "@virtualstate/promise/all-settled";

for await (const results of allSettledGenerator(promises)) {
  console.log({ results });
}
`.trim()}
    </pre>
    <p>For both, we would see</p>
    <pre>
      {`
{
  results: [
    { value: 1, status: "fulfilled" },
    { value: 2, status: "fulfilled" },
    undefined
  ]
}
{
  results: [
    { value: 1, status: "fulfilled" },
    { value: 2, status: "fulfilled" },
    { value: 3, status: "fulfilled" }
  ]
}
`.trim()}
    </pre>
    <Examples />
    <p>
      Now we have a function that we can take our promise, and group together
      sets of status updates for inspection.
    </p>
    <p>
      From this we can iteratively update dependent state on the fly as
      information becomes available while still maintaining connectivity between
      all the input promises as a whole.
    </p>
    <p>
      The problem here is you now have to deal with two different functions
      depending on how you construct these promise groups, or how you want to
      read them
    </p>
    <p>
      To solve this, we can expand on JavaScript's native functionality and
      merge together the two async concepts together
    </p>
    <p>
      Say we had our generator function, and we first wanted to be able to read
      it as a promise
    </p>
    <pre>
      {`
import { anAsyncThing } from "@virtualstate/promise/the-thing";
import { allSettledGenerator } from "@virtualstate/promise/all-settled";

const asyncIterable = allSettledGenerator(promises);
const object = anAsyncThing(asyncIterable);

const finalYieldedResult = await object;
console.log({ finalYieldedResult });
`.trim()}
    </pre>
    <p>For this promise, we would see</p>
    <pre>
      {`
{
  finalYieldedResult: [
    { value: 1, status: "fulfilled" },
    { value: 2, status: "fulfilled" },
    { value: 3, status: "fulfilled" }
  ]
}
`.trim()}
    </pre>
    <p>
      We are taking a leap here and assuming that each yielded value from an
      async iterable is its current state, and the final yielded value from it,
      is representing the "final state" or "returned" value
    </p>
    <p>
      Next, we would want to be able to from the same object, again use it's
      original input async iterable
    </p>
    <pre>
      {`
const asyncIterable = allSettledGenerator(promises);
const object = anAsyncThing(asyncIterable);

for await (const results of object) {
  console.log({ results });
}
`.trim()}
    </pre>
    <p>For this for await, we would see the original</p>
    <pre>
      {`
{
  results: [
    { value: 1, status: "fulfilled" },
    { value: 2, status: "fulfilled" },
    undefined
  ]
}
{
  results: [
    { value: 1, status: "fulfilled" },
    { value: 2, status: "fulfilled" },
    { value: 3, status: "fulfilled" }
  ]
}
`.trim()}
    </pre>
    <p>
      Now we have this shared object, we can provide this directly as a function
      that matches both our allSettledGenerator function's signature, but can
      also match the signature of the built in Promise.allSettle
    </p>
    <pre>
      {`
import { allSettled } from "@virtualstate/promise/all-settled";

const object = allSettled(promises);
`.trim()}
    </pre>
    <pre>
      {`
console.log({ finalYieldedResult: await object });
`.trim()}
    </pre>
    <pre>
      {`
for await (const state of object) {
  console.log({ state });
}
`.trim()}
    </pre>

    <p>
      Following the implementation of allSettled, we can implement all in the
      same light
    </p>
    <p>First implementing allGenerator, then a matching all function</p>
    <pre>
      {`
import { allGenerator } from "@virtualstate/promise/all";

const asyncIterable = allGenerator(promises);
const object = anAsyncThing(asyncIterable);
`.trim()}
    </pre>
    <pre>
      {`
import { all } from "@virtualstate/promise/all";

const object = all(promises);
`.trim()}
    </pre>
    <pre>
      {`
console.log({ finalYieldedResult: await object });
`.trim()}
    </pre>
    <pre>
      {`
for await (const state of object) {
  console.log({ state });
}
`.trim()}
    </pre>
    <p>
      With this, we have a matching signature to Promise.all, and
      Promise.allSettled, while still being able to inspect individual promise
      statuses and values as they happen.{" "}
    </p>
    <p>
      Given we have a consistent way to both input and output async iterables
      and promises, we can open our input up to also include async functions,
      which return promises, and async generator functions, which return async
      iterables.
    </p>
    <p>
      <a
        target="_blank"
        rel="noopener"
        href="https://github.com/virtualstate/promise/commit/b854229ae6ef7f624a639d15a251098c7cd50e9f#diff-91241161695e12a799702b5f738bb39e34e2fe542a0ddcc515ee630973de3573R30-R45"
      >
        Implementing this
      </a>{" "}
      involves providing additional mapping for these extra value types, while
      still providing the default promise resolution.
    </p>
    <p>
      If we come across an async iterable input type, we again assume that each
      yielded value is only the objects current state, and that the final
      fulfilled value is its settled & returned state.
    </p>
    <p>
      If we come across a function, we assume it is a zero argument function
      that returns a promise or an async iterable, and then follow the same
      already defined steps.
    </p>
    <p>
      Because the all function is implemented using allSettledGenerator as its
      core source, it required no implementation change for this.
    </p>
    <p>We can see now we can use a mix of inputs:</p>
    <pre>
      {`
const asyncValues = [
  Promise.resolve(1),
  async () => 2,
  async function *() {
    yield 3;
  },
  {
    async *[Symbol.asyncIterator]() {
      yield 4;
    }
  }
];
`.trim()}
    </pre>
    <pre>
      {`
import { allSettled } from "@virtualstate/promise/all-settled";
const object = allSettled(asyncValues);
`.trim()}
    </pre>
    <pre>
      {`
import { all } from "@virtualstate/promise/all";
const object = all(asyncValues);
`.trim()}
    </pre>
    <p>
      The resulting repository & module used in this post can be found at{" "}
      <a
        href="https://github.com/virtualstate/promise"
        target="_blank"
        rel="noopener"
      >
        github.com/virtualstate/promise
      </a>
    </p>
  </section>
);

async function Examples() {
  return (
    <>
      <script type="application/json" hidden id="withUnion">
        {JSON.stringify(await withUnion(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="withAllSettled">
        {JSON.stringify(await withAllSettled(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="asyncThing">
        {JSON.stringify(await asyncThing(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="asyncThingForAwait">
        {JSON.stringify(await asyncThingForAwait(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="asyncThingBoth">
        {JSON.stringify(await asyncThingBoth(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="asyncThingAllBoth">
        {JSON.stringify(await asyncThingAllBoth(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="inputAnyAllSettled">
        {JSON.stringify(await inputAnyAllSettled(), undefined, "  ")}
      </script>
      <script type="application/json" hidden id="inputAnyAll">
        {JSON.stringify(await inputAnyAll(), undefined, "  ")}
      </script>
    </>
  );
}

async function withUnion() {
  const promises = makePromises();
  const returningResults = [];
  for await (const unionResults of union(
    promises.map(async function* (promise) {
      try {
        yield { status: "fulfilled", value: await promise };
      } catch (reason) {
        yield { status: "rejected", reason };
      }
    })
  )) {
    console.log({ unionResults });
    returningResults.push(unionResults);
  }
  return returningResults;
}

// const results = [
//   { results: [{ value: 1, status: "fulfilled" }, undefined, undefined] },
//   {
//     results: [
//       { value: 1, status: "fulfilled" },
//       { value: 2, status: "fulfilled" },
//       undefined,
//     ],
//   },
//   {
//     results: [
//       { value: 1, status: "fulfilled" },
//       { value: 2, status: "fulfilled" },
//       { value: 3, status: "fulfilled" },
//     ],
//   },
// ];

async function withAllSettled() {
  const promises = makePromises();
  const returningResults = [];
  for await (const allSettledResults of allSettledGenerator(promises)) {
    console.log({ allSettledResults });
    returningResults.push(allSettledResults);
  }
  return returningResults;
}

function makePromises() {
  return [
    Promise.resolve(1 as const),
    Promise.resolve(2 as const),
    //   new Promise<void>(queueMicrotask).then(() => 1),
    // new Promise<void>(queueMicrotask).then(() => 1),
    new Promise((resolve) => setTimeout(() => resolve(3), 10)),
  ] as const;
}

function makeAsyncValues() {
  return [
    Promise.resolve(1),
    async () => 2,
    async function* () {
      yield 3;
    },
    {
      async *[Symbol.asyncIterator]() {
        yield 4;
      },
    },
  ] as const;
}

// async function examples() {
//   await withUnion();
//   await withAllSettled();
// }
//
// void examples();

async function asyncThing() {
  const promises = makePromises();
  const asyncIterable = allSettledGenerator(promises);
  const object = anAsyncThing(asyncIterable);

  const asyncThingFinalYieldedResult = await object;
  console.log({ asyncThingFinalYieldedResult });
  return asyncThingFinalYieldedResult;
}
async function asyncThingForAwait() {
  const promises = makePromises();
  const asyncIterable = allSettledGenerator(promises);
  const object = anAsyncThing(asyncIterable);

  const returningResults = [];
  for await (const asyncThingForAwaitState of object) {
    console.log({ asyncThingForAwaitState });
    returningResults.push(asyncThingForAwaitState);
  }
  return returningResults;
}
async function asyncThingBoth() {
  const returningResults = [];

  const asyncThingFinalYieldedResult = await allSettled(makePromises());
  console.log({ asyncThingFinalYieldedResult });
  returningResults.push({ finalYieldedResult: asyncThingFinalYieldedResult });

  for await (const asyncThingForAwaitState of allSettled(makePromises())) {
    console.log({ asyncThingForAwaitState });
    returningResults.push({ results: asyncThingForAwaitState });
  }
  return returningResults;
}
async function asyncThingAllBoth() {
  const returningResults = [];

  const asyncThingFinalYieldedResult = await all(makePromises());
  console.log({ asyncThingFinalYieldedResult });
  returningResults.push({ finalYieldedResult: asyncThingFinalYieldedResult });

  for await (const asyncThingForAwaitState of all(makePromises())) {
    console.log({ asyncThingForAwaitState });
    returningResults.push({ results: asyncThingForAwaitState });
  }
  return returningResults;
}
async function inputAnyAllSettled() {
  const returningResults = [];
  const asyncThingFinalYieldedResult = await allSettled(makeAsyncValues());
  console.log({ asyncThingFinalYieldedResult });
  returningResults.push({ finalYieldedResult: asyncThingFinalYieldedResult });
  for await (const asyncThingForAwaitState of allSettled(makeAsyncValues())) {
    console.log({ asyncThingForAwaitState });
    returningResults.push({ results: asyncThingForAwaitState });
  }
  return returningResults;
}
async function inputAnyAll() {
  const returningResults = [];
  const asyncThingFinalYieldedResult = await all(makeAsyncValues());
  console.log({ asyncThingFinalYieldedResult });
  returningResults.push({ finalYieldedResult: asyncThingFinalYieldedResult });
  for await (const asyncThingForAwaitState of all(makeAsyncValues())) {
    console.log({ asyncThingForAwaitState });
    returningResults.push({ results: asyncThingForAwaitState });
  }
  return returningResults;
}
