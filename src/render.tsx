import { render as dom, DOMVContext, createTimeline, Timeline } from '@virtualstate/dom';
import { SiteBody } from './site';
import { Posts } from './contents/blog';
import { h } from "./h";
import { Template } from './template';

export async function render() {

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

    const url = new URL(window.location.href);

    let site = <SiteBody />;
    let templateSite = false;
    const postPathName = url.pathname.replace(/\/+$/, "");
    const foundPost = Posts.find(post => postPathName === post.options.path)
    if (foundPost) {
        templateSite = true;
        site = foundPost;
    }

    if (site.options?.title) {
        document.title = site.options.title;
    }

    const descriptionContent = site.options?.description ?? site.options?.summary;
    if (descriptionContent) {
        let description: HTMLMetaElement | undefined = document.head.querySelector<HTMLMetaElement>("meta[name=description]") ?? undefined;
        if (!description) {
            description = document.createElement("meta");
            description.name = "description";
            document.head.append(description);
        }
        description.content = descriptionContent;
    }

    if (templateSite) {
        site = (
          <Template id={`main-${url.pathname}`.replace(/\/+/g, "_")}>
              {site}
          </Template>
        )
    }

    await dom(
      (
        <main>
            {site}
            <footer>
                <h4>Licence</h4>
                <p>
                    This website and <a href="https://github.com/fabiancook/fabiancook.dev" target="_blank" rel="noopener noreferrer">associated GitHub respository</a> is licensed under the <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer">CC0 1.0 Universal</a> license.
                </p>
            </footer>
        </main>
      ),
      context
    );

    console.log("Completed rendering");

    await context.close();

    // await reportTimeline(await timelinePromise);
}

async function reportTimeline(timeline: Timeline) {
    // console.log(timeline[timeline.length - 1]);
}
