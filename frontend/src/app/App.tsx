import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { ActiveUserProvider } from './context/ActiveUserContext';
import { router } from './routes';

export default function App() {
  return (
    <ActiveUserProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ActiveUserProvider>
  );
}
