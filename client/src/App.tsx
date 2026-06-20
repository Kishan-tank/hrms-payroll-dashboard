import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
