import {redeclare} from "./jsdom.js";
import { promises as fs } from "node:fs";
import { dirname, join } from 'node:path';
import JSDOM from 'jsdom';
import config from "../snowpack.config.js";
import mkdirp from "mkdirp";
import { PerformanceObserver, performance } from "perf_hooks";
import { Worker, isMainThread, parentPort } from "worker_threads";
import { createHook } from "async_hooks";
import { createConnection } from "net";
import { createHash, randomBytes } from 'crypto';
import { promisify } from 'util';

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries());
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

const path = "../build";

const directory = dirname(new URL(import.meta.url).pathname);

const { name } = JSON.parse(await fs.readFile(join(directory, "../package.json"), "utf-8"))

global.setTimeout = queueMicrotask;

let knownPaths = new Set(config.optimize.entrypoints);
let renderedPaths = new Set();

function getRemainingPaths() {
  return new Set([...knownPaths].filter(path => !renderedPaths.has(path)));
}

let remainingPaths;
while ((remainingPaths = getRemainingPaths()).size) {
  const entry = remainingPaths[Symbol.iterator]().next().value;

  const url = new URL(
    `/${entry}`
      .replace(/^\/+/, "/")
      .replace(/\.html$/, "")
      .replace(/\/index$/, "/"),
    `https://${name}`
  );


  const types = new Map();
  let count = 0n;
  let resolved = 0n;
  createHook({
    init(asyncId, type) {
      count += 1n;
      types.set(type, (types.get(type) || 0n) + 1n);
    },
    promiseResolve(asyncId) {
      resolved += 1n;
    }
  }).enable();

  console.log(url, url.toString());
  performance.mark('A');

  const dom = new JSDOM.JSDOM("", {
    url: url.toString()
  });
  redeclare(dom);

  // Create a new root element
  const root = dom.window.document.querySelector("#root") ?? dom.window.document.createElement("div");
  root.id = "root";

  // Appending our root to the document body
  dom.window.document.body.append(root);

  let someQueue = Promise.resolve();

  function envNumber(key, def, decimalOrNah, bitInt) {
    const value = process.env[key];
    if (decimalOrNah && /^\d+\.\d+$/.test(value)) {
      return +value;
    }
    const isInt = /^\d+$/.test(value);
    if (isInt && bitInt) {
      return BigInt(value);
    } else if (isInt) {
      return +value;
    }
    return def;
  }
  const socketPort = envNumber("OPERATION_SOCKET_PORT");
  dom.window.scale = envNumber("OPERATION_SCALE", 1);
  dom.window.scaleWidth = envNumber("OPERATION_SCALE_WIDTH", 1);
  dom.window.scaleBigInt = envNumber("OPERATION_SCALE", 1n, false, true);
  dom.window.scaleWidthBigInt = envNumber("OPERATION_SCALE_WIDTH", 1n, false, true);

  const socket = socketPort ? createConnection(socketPort) : undefined;
  let noOp = !socket;
  socket?.on("error", () => noOp = true);
  socket?.on("close", () => noOp = true);
  if (!noOp) {
    process.once("uncaughtException", () => noOp = true);
  }
  const seen = new Set();
  dom.window.operation = async function operation(symbol) {
    if (typeof symbol !== "symbol") return;
    if (seen.has(symbol)) return;
    seen.add(symbol);
    if (noOp) return;
    return someQueue = someQueue.then(async () => {
      if (noOp) return;
      const hash = createHash("sha256");
      hash.update(symbol.toString());
      const digest = hash.digest();
      const padded = await promisify(randomBytes)(2.5 * 1024 * 1024);
      padded.set(Buffer.alloc(100, 1), 0);
      padded.set(Buffer.from(symbol.toString()), 0);
      padded.set(digest, 100);
      await new Promise(resolve => socket.write(padded, (error) => {
        if (error) {
          noOp = true;
          return;
        }
        resolve();
      }));
    });
  }

  // This will initialise our sites render
  const { render } = await import("../build/render.js");

  await render();
  performance.mark('B');
  performance.measure(`A to B`, 'A', 'B');
  console.log({ count, resolved, types });

  if (socket) {
    await promisify(socket.end).call(socket);
  }

  // The snowpack bundler does not have top level await support, so we must utilise the global
  // the above import sets
  await dom.window.siteRender;

  let entryPath = join(directory, path, entry);

  async function isFile(path) {
    return (await fs.stat(path).catch(() => undefined))?.isFile() ?? false;
  }

  async function getEntryPathFile(entryPath) {
    if (!await isFile(entryPath)) {
      if (await isFile(join(entryPath, "index.html"))) {
        return join(entryPath, "index.html");
      } else if (await isFile(`${entryPath}.html`)) {
        entryPath = `${entryPath}.html`;
      }
    }
    return entryPath;
  }

  let outputPath = entryPath;
  if (!/\.html$/.test(outputPath)) {
    if (outputPath.endsWith("/")) {
      outputPath = `${outputPath}index.html`;
    } else {
      outputPath = `${outputPath}.html`;
    }
  }

  entryPath = await getEntryPathFile(entryPath);
  if (!await isFile(entryPath)) {
    const defaultPath = join(directory, path, config.optimize.entrypoints[0]);
    // The default entry point
    entryPath = await getEntryPathFile(defaultPath);
  }
  const entryContents = await fs.readFile(entryPath, "utf8");
  const target = new JSDOM.JSDOM(entryContents);

  const targetRoot = target.window.document.querySelector("#root") ?? target.window.document.createElement("div");
  targetRoot.id = "root";
  targetRoot.innerHTML = root.innerHTML;

  // Copy over generated templates
  const template = document.createElement("template");
  const foundTemplates = document.body.querySelectorAll("template[id]");

  const links = new Set();

  // Remove any existing versions of the template found
  for (const foundTemplate of foundTemplates) {
    const existing = target.window.document.getElementById(foundTemplate.id);
    if (existing) {
      existing.parentElement.removeChild(existing);
    }
    template.content.append(foundTemplate);
  }


  // Create a template in our target DOM and then copy over using an HTML string
  // then append these to the targets body using the target templates DocumentFragment
  const targetTemplate = target.window.document.createElement("template");
  targetTemplate.innerHTML = template.innerHTML;
  target.window.document.body.append(targetTemplate.content);

  const toRemove = new Set();
  target.window.document.querySelectorAll("[data-remove-after-prerender]")
    .forEach(node => toRemove.add(node));
  dom.window.document.querySelectorAll("meta[name]")
    .forEach((node) => {
      target.window.document.querySelectorAll(`meta[name="${node.name}"]`)
        .forEach(node => toRemove.add(node));
    });
  for (const remove of toRemove) {
    remove.parentNode.removeChild(remove);
  }

  target.window.document.title = dom.window.document.title || target.window.document.title;
  target.window.document.querySelectorAll(`[href]`)
    .forEach(node => links.add(node.getAttribute("href")));

  const metaTemplate = target.window.document.createElement("template");
  dom.window.document.head.querySelectorAll(`meta[name]`)
    .forEach(node => {
      target.window.document.adoptNode(node);
      metaTemplate.content.append(node);
    });
  target.window.document.head.append(metaTemplate.content);


  for (const link of links) {
    // Non extension links only
    if (/^(\/[a-z0-9-_]+)+$/i.test(link)) {
      // Add new paths to render
      knownPaths.add(link);
    }
  }

  // Clear body so render can re-run and templates will be utilised
  targetRoot.innerHTML = "";

  await mkdirp(dirname(outputPath));

  // Write to disk
  await fs.writeFile(
    outputPath,
    target.serialize()
  )

  renderedPaths.add(entry);
}

