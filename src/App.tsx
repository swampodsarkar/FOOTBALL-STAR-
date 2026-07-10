import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { onAuthChange, ensureAnon } from './services/firebase';
import { useCloudStore } from './stores/cloudStore';
import AppRouter from './pages/Router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const setStatus = useCloudStore((s) => s.setStatus);
  const setUid = useCloudStore((s) => s.setUid);
  const setEmail = useCloudStore((s) => s.setEmail);
  const setInitialized = useCloudStore((s) => s.setInitialized);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setUid(user.uid);
        if (user.isAnonymous) {
          setStatus('guest');
          setEmail(null);
        } else {
          setStatus('connected');
          setEmail(user.email);
        }
      } else {
        try {
          await ensureAnon();
        } catch {
          // Firebase might be blocked or unavailable
          setStatus('error');
        }
      }
      setInitialized(true);
    });
    return unsub;
  }, [setStatus, setUid, setEmail, setInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <div className="min-h-screen bg-gray-950 text-white">
          <AppRouter />
        </div>
      </HashRouter>
    </QueryClientProvider>
  );
}
