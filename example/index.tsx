import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createNotificationContext } from '../.';

interface Notification {
  message: string;
}

const {
  NotificationProvider,
  useNotificationQueue,
} = createNotificationContext<Notification>();

function Button() {
  const notifications = useNotificationQueue();

  function addNotification() {
    const id = Date.now().toString();
    const timeout = setTimeout(() => notifications.remove(id), 3000);
    notifications.add(id, { message: 'Hello' }, () => clearTimeout(timeout));
  }

  function clearAll() {
    notifications.removeAll();
  }

  return (
    <>
      <button onClick={addNotification}>Add notification</button>
      <button onClick={clearAll}>Clear all</button>
    </>
  );
}

function NotificationList() {
  const queue = useNotificationQueue();

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 100,
        bottom: 16,
        left: '50%',
        transform: 'translate(-50%, 0)',
      }}
    >
      <AnimatePresence>
        {queue.entries.map(({ id, data }) => (
          <motion.div
            key={id}
            positionTransition
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <Notification message={data.message} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Notification({ message }) {
  return (
    <div
      style={{
        minWidth: 300,
        paddingRight: 40,
        background: '#333',
        boxShadow: '0 4px 40px 0 rgba(0, 0, 0, 0.07)',
        borderRadius: 4,
        marginBottom: 8,
        position: 'relative',
        padding: 16,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {message}
    </div>
  );
}

const App = () => {
  return (
    <NotificationProvider>
      <Button />
      <NotificationList />
    </NotificationProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
