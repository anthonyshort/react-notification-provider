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
