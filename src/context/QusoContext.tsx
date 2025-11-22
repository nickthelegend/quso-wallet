import React, { createContext, useContext, useState } from "react";

interface QusoContextType {
  user: any | null;
  login: (provider: "google" | "github") => Promise<void>;
  logout: () => void;
}

const QusoContext = createContext<QusoContextType | undefined>(undefined);

export const QusoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const login = async (provider: "google" | "github") => {
    console.log("Logging in with", provider);
    setUser({ name: "Demo User", provider });
  };

  const logout = () => setUser(null);

  return (
    <QusoContext.Provider value={{ user, login, logout }}>
      {children}
    </QusoContext.Provider>
  );
};

export const useQuso = () => {
  const ctx = useContext(QusoContext);
  if (!ctx) throw new Error("useQuso must be used inside QusoProvider");
  return ctx;
};
