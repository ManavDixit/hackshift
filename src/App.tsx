import { AppProvider } from '@/lib/appContext';
import { Router } from '@/Router';

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App;
