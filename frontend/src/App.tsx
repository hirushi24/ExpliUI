import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import AppRouter from "./routers/AppRouter";

// App shell that provides routing and shared session state to the whole frontend.
export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRouter />
      </SessionProvider>
    </BrowserRouter>
  );
}
