import { h } from "../../../../../h";
import { isScalarVNode, VNode } from '@virtualstate/x';

export default (
  <section>
    <DoThings>
      <Things global={25000} internal={1} />
    </DoThings>
  </section>
)

async function DoThings(o: unknown, state: VNode) {
  const stateEvents = state.children;
  if (!stateEvents) return;
  let totalEvents = 0;
  const seen = new Set();
  for await (const events of stateEvents) {
    const unseen = events
      .filter(isScalarVNode)
      .map(node => node.source)
      .filter((source): source is symbol => typeof source === "symbol")
      .filter(event => !seen.has(event))
    unseen.forEach(source => seen.add(source));
    // You will receive global * internal events here
    totalEvents += events.length;
    if (window.operation) {
      await Promise.all(
        unseen.map(window.operation)
      );
    }
  }
  console.log({ totalEvents });
}

interface ThingOptions {
  id: number;
  internal: number;
}

async function *Thing({ id, internal }: ThingOptions) {
  for (let i = 0; i < internal; i += 1) {
    yield Symbol(id);
  }
}

interface ThingsOptions {
  global: number;
  internal: number;
}

function Things({ global, internal }: ThingsOptions) {
  return Array.from({ length: global }, (_, id) => <Thing id={id} internal={internal} />);
}
