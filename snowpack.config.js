/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    /* ... */
    "src": "/",
    "src/2021/05/18": "/2021/05/18",
    "public": "/"
  },
  exclude: [
    "**/node_modules/**/*",
  ],
  plugins: [
    /* ... */
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: true,
    minify: true,
    target: "es2018",
    entrypoints: [
      "index.html",
      "2021/05/18/concurrent-unions.html"
    ]
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
    jsxFactory: "h",
    jsxFragment: "createFragment"
  },
  env: {

  }
};
