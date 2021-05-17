import { render, DOMVContext, createTimeline, Timeline } from '@opennetwork/vdom';
import { SiteBody } from './site';
import { ConcurrentUnions20210518 } from './contents/blog';
import { h } from "./h";
import { hookFragments } from '@opennetwork/vnode-fragment';

async function run() {

    const root = document.getElementById("root");

    if (!root) {
        throw new Error("Expected root");
    }

    const context = new DOMVContext({
        root
    });

    // const timelinePromise = createTimeline(
    //   context,
    //   reportTimeline
    // );

    let site = <SiteBody />;

    switch (new URL(window.location.href).pathname) {
        case "/2021/05/18/concurrent-unions": {
            site = ConcurrentUnions20210518;
            break;
        }
    }

    await render(
      await hookFragments()((
        <main>
            {site}
            <footer>
                <h4>Licence</h4>
                <p>
                    This website and <a href="https://github.com/fabiancook/fabiancook.dev" target="_blank" rel="noopener noreferrer">associated GitHub respository</a> is licensed under the <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">CC0 1.0 Universal</a> license.
                </p>
            </footer>
        </main>
      )),
      context
    );

    console.log("Completed rendering");

    await context.close();

    // await reportTimeline(await timelinePromise);
}

async function reportTimeline(timeline: Timeline) {
    // console.log(timeline[timeline.length - 1]);
}

window.proposalSiteRender = run();
window.proposalSiteRender.catch(error => {
    throw error;
});

