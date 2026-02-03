import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { api } from "../api/clients";

interface SessionContextType {
  sessionId: string | null;
  initSession: () => Promise<void>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem("expliui_session");
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const initSession = async () => {
    setIsLoading(true);
    try { 
      // Changed from "/session/create" to "/create_test"
      // This matches your backend: @router.post("/create_test")
      const res = await api.post("/create_test"); 
      
      const newId = res.data.session_id;
      setSessionId(newId);
      localStorage.setItem("expliui_session", newId);
      console.log("Session Created:", newId);
    } catch (err) {
      console.error("Failed to init session", err);
      // alert("Backend connection failed. Please check the console (F12) for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SessionContext.Provider value={{ sessionId, initSession, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
};