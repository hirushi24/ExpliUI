import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import AppRouter from "./routers/AppRouter";

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRouter />
      </SessionProvider>
    </BrowserRouter>
  );
}