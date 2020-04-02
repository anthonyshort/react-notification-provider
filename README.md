# react-notifications-hook

This makes it easy to create your own notification system in your React app without having to buy into some prescribed
styling or templating. It does this by giving you three things:

- `useNotificationQueue` hook to create a queue of notifications in your app.
- `createNotificationContext` to create a hook and provider pair to create your own provider.

## Usage

First you'll need to create your own `NotificationProvider` and render it at the top of your app.

> If you're using Next this would mean in `pages/_app.tsx`.

This component will be used to render the list of notifications.

```tsx
export function NotificationProvider(props: Props): JSX.Element {
  const { children } = props;
  const queue = useNotificationQueue<Notification>();

  return (
    <div>
      {children}
      <div>
        {queue.list.map(notification => (
          <div>{notification.data.title}</div>
        ))}
      </div>
    <div>
  );
}
```

Next you'll need to create the context provider and hook, passing in the notification type if you're using Typescript.

```tsx
export type Notification = {
  duration?: number;
  title?: string;
  type?: 'success' | 'error';
};

const {
  useNotifications,
  NotificationQueueProvider,
} = createNotificationContext<Notification>();
```

Now you want to add this queue provider to `NotificationProvider`.

```tsx
export function NotificationProvider(props: Props): JSX.Element {
  const { children } = props;
  const queue = useNotificationQueue<Notification>();

  return (
    <NotificationQueueProvider queue={queue}>
      {children}
      <div>
        {queue.list.map(notification => (
          <div>{notification.data.title}</div>
        ))}
      </div>
    </NotificationQueueProvider>
  );
}

export { useNotifications };
```

Here I've wrapped the children and notification in the provider and I've exported the hook. The provider will allow
the rest of the components in your app to access the notifications.

You can add animation to your notifications easily using [Framer motion](https://www.framer.com/motion/). Just import it:

```ts
import { motion, AnimatePresence } from 'framer-motion';
```

And then wrap your notifications.

```tsx
export function NotificationProvider(props: Props): JSX.Element {
  const { children } = props;
  const queue = useNotificationQueue<Notification>();

  return (
    <NotificationQueueProvider queue={queue}>
      {children}
      <AnimatePresence>
        {queue.list.map(notification => {
          return (
            <motion.div
              key={queued.id}
              positionTransition
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            >
              {notification.data.title}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </NotificationQueueProvider>
  );
}

export { useNotifications };
```

Now in your components you can simply import the hook:

```tsx
import { useNotification } from 'lib/notifications-provider';

function MyComponent() {
  const notifications = useNotifications();

  function notify() {
    notifications.add('example', {
      title: 'Hello world',
    });
  }

  return <div onClick={notify}>Show notification</div>;
}
```

## Example

This is an example `NotificationProvider` you'll need to create for your app.

> Note: You'll still need to apply your own styling.

```tsx
import React from 'react';
import {
  useNotificationQueue,
  createNotificationContext,
} from 'react-notifications-hook';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: React.ReactNode;
}

export type Notification = {
  duration?: number;
  title?: string;
  type?: 'success' | 'error';
};

const {
  NotificationQueueProvider,
  useNotifications,
} = createNotificationContext<Notification>();

export function NotificationProvider(props: Props): JSX.Element {
  const { children } = props;
  const notifications = useNotificationQueue<Notification>();

  return (
    <NotificationQueueProvider queue={notifications}>
      {children}
      <AnimatePresence>
        {notifications.list.map(notification => {
          return (
            <motion.div
              key={queued.id}
              positionTransition
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            >
              {notification.data.title}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </NotificationQueueProvider>
  );
}

export { useNotifications };
```

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
