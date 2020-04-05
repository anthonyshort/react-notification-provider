# react-notification-provider

Easily create your own notification system in your React app without having to buy into prescribed styling or templating.

- 💅 No styling included
- 🎣 Uses React hooks and context
- ✨ Easily add animation using [Framer Motion](https://www.framer.com/motion/).
- 🏋️‍♀️ Typescript support
- 🚨 Custom notification properties
- 💻 Mock and test notifications in your app

```tsx
function MyComponent() {
  const notification = useNotificationQueue();

  function notify() {
    notification.add('example', {
      title: 'Hello world',
    });
  }

  return <div onClick={notify}>Show notification</div>;
}
```

## Usage

You'll start by using the `createNotificationContext` function to create the React context, hooks, and helpers. You should create this in a file you can import throughout your application. In this example, we'll create it as `lib/notifications/index.tsx`.

```ts
// You can customize the notification interface to include whatever props your notifications need to render.
interface Notification {
  message: string;
  duration: number;
  level: 'success' | 'error';
}

// This function creates a React context and hooks for you so you'll want to export these.
const {
  NotificationProvider,
  useNotificationQueue,
} = createNotificationProvider<Notification>();

export { NotificationProvider, useNotificationQueue };
```

Now you want to wrap your application in this provider. This will allow you to use the `useNotificationQueue` hooks.

> If you're using Next.js you should render this provider in your `pages/_app` file so that it's available on every page.

```tsx
import { NotificationProvider } from 'lib/notifications';

function App(props: Props) {
  const { children } = props;

  return (
    <NotificationProvider>
      {children}
      <NotificationList />
    <NotificationProvider>
  );
}
```

In this example we're rendering a components, `NotificationList` that will load the notification queue from the React context and render the list of notifications on the page.

> In this example, `<Notification />` would be your custom component that renders a notification UI component.

```tsx
import { notifications } from 'lib/notifications';

function NotificationList() {
  const queue = useNotificationQueue();

  return (
    <div>
      {queue.entries.map(({ id, data }) => (
        <Notification key={id} message={data.message} />
      ))}
    </div>
  );
}
```

Now let's add animation to our notifications using [Framer motion](https://www.framer.com/motion/):

```tsx
import { useNotificationQueue } from 'lib/notifications';
import { motion, AnimatePresence } from 'framer-motion';

function NotificationList() {
  const queue = useNotificationQueue();

  return (
    <AnimatePresence>
      {queue.entries.map(({ id, data }) => (
        <motion.div
          key={id}
          positionTransition
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
          <Notification key={id} message={data.message} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

Now when you want to trigger a notification from anywhere in your application you can import the hook and use it:

```tsx
import { useNotificationQueue } from 'lib/notifications';

function MyComponent() {
  const notification = useNotificationQueue();

  function onClick() {
    notification.add('example', {
      title: 'Hello world',
    });
  }

  return <div onClick={onClick}>Show notification</div>;
}
```

# Development

## Commands

TSDX scaffolds your new library inside `/src`, and also sets up a [Parcel-based](https://parceljs.org) playground for it inside `/example`.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run the example inside another:

```bash
cd example
npm i # or yarn to install dependencies
npm start # or yarn start
```

The default example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode like we recommend above. **No symlinking required**, [we use Parcel's aliasing](https://github.com/palmerhq/tsdx/pull/88/files).

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.

## Configuration

Code quality is [set up for you](https://github.com/palmerhq/tsdx/pull/45/files) with `prettier`, `husky`, and `lint-staged`. Adjust the respective fields in `package.json` accordingly.

### Jest

Jest tests are set up to run with `npm test` or `yarn test`. This runs the test watcher (Jest) in an interactive mode. By default, runs tests related to files changed since the last commit.

#### Setup Files

This is the folder structure we set up for you:

```shell
/example
  index.html
  index.tsx       # test your component here in a demo app
  package.json
  tsconfig.json
/src
  index.tsx       # EDIT THIS
/test
  blah.test.tsx   # EDIT THIS
.gitignore
package.json
README.md         # EDIT THIS
tsconfig.json
```

#### React Testing Library

We do not set up `react-testing-library` for you yet, we welcome contributions and documentation on this.

### Rollup

TSDX uses [Rollup v1.x](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

### TypeScript

`tsconfig.json` is set up to interpret `dom` and `esnext` types, as well as `react` for `jsx`. Adjust according to your needs.

## Continuous Integration

### Travis

_to be completed_

### Circle

_to be completed_

## Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

You can also choose to install and use [invariant](https://github.com/palmerhq/tsdx#invariant) and [warning](https://github.com/palmerhq/tsdx#warning) functions.

## Module Formats

CJS, ESModules, and UMD module formats are supported.

The appropriate paths are configured in `package.json` and `dist/index.js` accordingly. Please report if any issues are found.

## Using the Playground

```bash
cd example
npm i # or yarn to install dependencies
npm start # or yarn start
```

The default example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode like we recommend above. **No symlinking required**!

## Deploying the Playground

The Playground is just a simple [Parcel](https://parceljs.org) app, you can deploy it anywhere you would normally deploy that. Here are some guidelines for **manually** deploying with the Netlify CLI (`npm i -g netlify-cli`):

```bash
cd example # if not already in the example folder
npm run build # builds to dist
netlify deploy # deploy the dist folder
```

Alternatively, if you already have a git repo connected, you can set up continuous deployment with Netlify:

```bash
netlify init
# build command: yarn build && cd example && yarn && yarn build
# directory to deploy: example/dist
# pick yes for netlify.toml
```

## Named Exports

Per Palmer Group guidelines, [always use named exports.](https://github.com/palmerhq/typescript#exports) Code split inside your React app instead of your React library.

## Including Styles

There are many ways to ship styles, including with CSS-in-JS. TSDX has no opinion on this, configure how you like.

For vanilla CSS, you can include it at the root directory and add it to the `files` section in your `package.json`, so that it can be imported separately by your users and run through their bundler's loader.

## Publishing to NPM

We recommend using [np](https://github.com/sindresorhus/np).

## Usage with Lerna

When creating a new package with TSDX within a project set up with Lerna, you might encounter a `Cannot resolve dependency` error when trying to run the `example` project. To fix that you will need to make changes to the `package.json` file _inside the `example` directory_.

The problem is that due to the nature of how dependencies are installed in Lerna projects, the aliases in the example project's `package.json` might not point to the right place, as those dependencies might have been installed in the root of your Lerna project.

Change the `alias` to point to where those packages are actually installed. This depends on the directory structure of your Lerna project, so the actual path might be different from the diff below.

```diff
   "alias": {
-    "react": "../node_modules/react",
-    "react-dom": "../node_modules/react-dom"
+    "react": "../../../node_modules/react",
+    "react-dom": "../../../node_modules/react-dom"
   },
```

An alternative to fixing this problem would be to remove aliases altogether and define the dependencies referenced as aliases as dev dependencies instead. [However, that might cause other problems.](https://github.com/palmerhq/tsdx/issues/64)
