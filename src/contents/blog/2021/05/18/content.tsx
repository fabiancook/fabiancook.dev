import { Title, Summary } from "../../../post";
import { h } from "../../../../../h";
import { merge as union } from '@opennetwork/progressive-merge';
import { Unbound } from '../../../../../unbound';
import { createFragment } from '@opennetwork/vnode';

export default (
  <section>
    <p>
      For the last few years I had been constantly looking for a way to
      consume async values from multiple producers without needing to
      correlate how these values were produced.
    </p>
    <p>
      Throughout this journey I came across multiple ways to utilise
      these async values in JavaScript
    </p>
    <h2>Pushing one by one</h2>
    <p>
      I had initially implemented a <span class="code">class</span> that
      provided a <span class="code"><a rel="noopener" target="_blank" href="https://github.com/opennetwork/iterable/blob/b640b82c0746f58f1097781268ef52b41896c22f/src/core/transient-source.ts#L75">push(value)</a></span> <span class="code">function</span>,
      each individual call to <span class="code">push</span> resulted in a&nbsp;
      <a rel="noopener" href="https://github.com/opennetwork/iterable/blob/b640b82c0746f58f1097781268ef52b41896c22f/src/core/transient-source.ts#L239" target="_blank">new iteration for consumers.</a>
    </p>
    <p>
      This seemed okay, but because of the new iteration per <span class="code">push</span>
      I could never seem to group sets of iterations together from a consumers
      point of view.
    </p>
    <p>
      I tried to implement a union based on this code, but was unsuccessful
    </p>
    <h2>Batching by microtask</h2>
    <p>
      After refocusing on other things I found myself back at implementing a
      similar kind of <span class="code">class</span>, this time I was looking
      to watch what changes happened to a sync source over some set of time.
    </p>
    <p>
      I found that I was to collect each value in an <span class="code">array</span> across the&nbsp;
      <a rel="noopener" href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide" target="_blank">microtask</a>
      &nbsp;then after the callback for the next microtask was received
      I would take a copy of that array, reset the working array, and yield
      that new array.
    </p>
    <p>
      This provided me a clean and consistent way to batch by microtask. I hadn't
      yet realised that I could use this as well as part of a union.
    </p>
    <p>
      At a later point after publishing the <span class="code"><a rel="noopener" href="https://github.com/opennetwork/microtask-collector#readme">microtask-collector</a></span>
      &nbsp;module I found that I could start many async producers and collect
      everything within the same batch and yield non-overlapping groups of
      results.
    </p>
    <p>
      This however led to issues because now the execution of these async
      iterators are detached completely from the consumer, in some cases
      this may be whats wanted, but the implementation what I was looking for
      suited a just in time model better.
    </p>
    <p>
      All was not lost though, because this led me to the pattern I now utilise
      extensively.
    </p>
    <h2>The union</h2>
    <p>
      We can boil down the core of the union problem to the solution code
      below, I will break down each concept bit by bit.
    </p>
    <pre class="code">{
      `
async function wait() {
  const promises = knownIterators.map(next);

  currentMicrotaskPromise = currentMicrotaskPromise || new Promise(microtask).then(() => NextMicrotask);

  const reason = await Promise.any<unknown>([
    currentMicrotaskPromise,
    Promise.all(promises),
    errorOccurred.promise,
    iteratorAvailable.promise,
  ]);

  if (reason === NextMicrotask) {
    currentMicrotaskPromise = undefined;
  }

  if (!results.length) {
    await Promise.any([
      Promise.any(promises),
      errorOccurred.promise,
      iteratorAvailable.promise,
    ]);
  }

  if (errors.length) {
    return [];
  }
  if (!results.length) {
    return [];
  }
  const cloned = [...results];
  results = [];
  return cloned;
}
`.trim()}
      </pre>
    <h3>Setup</h3>
    <p>
      First within our function we can assume that we already have our
      known in flight iterators, this is named <span class="code">knownIterators</span>
      &nbsp;here.
    </p>
    <p>
      By using <span class="code">const promises = knownIterators.map(next);</span>
      &nbsp;we are mapping each iterator to either its next pending promise,
      or an existing promise if the iterator didn't resolve within
      the previous microtask.
    </p>
    <p>
      The variable <span class="code">currentMicrotaskPromise</span> is used to
      utilise the same microtask if all of our previous
      iterator promises resolved before the end of the microtask.
    </p>
    <h3>The first wait</h3>
    <p>
      Now that we have all the information required about our context we need
      to wait until something happens. For the first wait this is one of
      four processes.
    </p>
    <ol>
      <li>The microtask has finished</li>
      <li>All the promises have finished</li>
      <li>We found an error occurred somewhere within our union</li>
      <li>A new iterator is known and should be added to our promise set</li>
    </ol>
    <p>
      We use the microtask as a common target as it is the smallest shared
      async precision between all JavaScript code.
    </p>
    <p>
      If we have at least one result produced from with <span class="code">promises</span>
      , and we have no <span class="code">errors.length</span>
      &nbsp;then we have the next set of updated values, we clone these before
      returning and reset our working <span class="code">results</span> array
    </p>
    <pre class="code">
        {`const cloned = [...results];
results = [];
return cloned;`}
      </pre>
    <h3>The second wait</h3>
    <p>
      If we didn't have at least one result in the previous step, then before
      we move on to returning our results we want to wait until:
    </p>
    <ol>
      <li>At least one promise has finished</li>
      <li>We found an error occurred somewhere within our union</li>
      <li>A new iterator is known and should be added to our promise set</li>
    </ol>
    <p>
      Now, we are in a complete holding state until at least one
      thing changes within our context, this allows tasks to take longer than
      a microtask, for example the usage of <span class="code">setTimeout</span>
    </p>
    <h3>Yielding a result</h3>
    <p>
      Now that we have a set of values that represented the next state, externally
      from the above <span class="code">wait</span> function we can
      freely store a copy of the latest state for all iterators, and update
      it with every iteration, yielding to the consumers the newly snapshot
      state.
    </p>
    <p>
      In the end the implementation uses
    </p>
    <pre class="code">{`
const latestSnapshot = knownIterators.map(read);
      
if (onlyDone) {
  continue;
}

if (!valuesDone) {
  yield latestSnapshot.map(result => result?.value);
}
      `}</pre>
    <p>
      Externally to the consumer this means:
    </p>
    <ul>
      <li>The snapshot follows the same order as the initial input</li>
      <li>A source iteration result may appear more than once</li>
      <li>Only snapshots with new results will yield</li>
    </ul>
    <p>
      The second point shows as <a rel="noopener" href="https://lamport.azurewebsites.net/tla/advanced.html?unhideBut=hide-stuttering&unhideDiv=stuttering" target="_blank">stuttering steps</a>
      &nbsp;to a consumer. If the source values are unique the consumer can freely
      ignore values it already knows, allowing for this implementation to
      freely provide maximum consistency.
    </p>
    <h3>Consuming</h3>
    <p>
      The resulting union can be consumed using <span class="code"><a rel="noopener" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of" target="_blank">for await</a></span>
    </p>
    <p>
      Say we had two generator functions producing a value from an array at different rates, defined
      by the below code:
    </p>
    <pre class="code">
    {`
async function *timedGenerator(values, interval) {
  const clone = values.slice();
  while(clone.length) {
    yield clone.shift();
    await new Promise(resolve => setTimeout(resolve, interval));
  } 
}

for await(const [left, right] of union([
  timedGenerator([1, 2, 3], 500), 
  timedGenerator([5, 6, 7], 1000)
])) {
  console.log({ left, right });
}
    `.trim()}
      </pre>
    <div hidden>
      <Unbound>
        <TimedGeneratorExample />
      </Unbound>
    </div>
    <p>
      By the end of the above code <span class="code">{`{ "left": 3, "right": 7 }`}</span>
      &nbsp;will be the last console log.
    </p>
    <h2>Summary</h2>
    <p>
      This union function provided a way for async and sync iterators (and inherently generators)
      to be synchronised across many sources, allowing a consumer to focus
      on the set as a whole.
    </p>
    <p>
      After minor performance testing I found this code to perform well under
      pressure, utilising it as a core pillar of the benchmarked code
      I was able to push a single Node.js process to utilise over <a rel="noopener" href="https://twitter.com/FabianCook/status/1390954150121250823" target="_blank">three billion</a>
      &nbsp;promises, resolving each before safely exiting.
    </p>
    <p>
      This code produced consistent promise and microtask counts across many executions,
      showing it allows for deterministic just in time execution within JavaScript.
    </p>
  </section>
)

async function *timedGenerator(values: number[], interval: number) {
  const clone = values.slice();
  while(clone.length) {
    yield clone.shift();
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function *TimedGeneratorExample() {
  for await (const [left, right] of union([
    timedGenerator([1, 2, 3], 500),
    timedGenerator([5, 6, 7], 1000)
  ])) {
    // console.log({ left, right });
    yield JSON.stringify({ left, right });
  }
}
