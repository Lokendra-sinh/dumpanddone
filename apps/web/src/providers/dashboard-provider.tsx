import React, { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "@tanstack/react-router";
import { TiptapDocument } from "../types/tiptap-blog";
import { socketClient } from "@/utils/socket";


interface DashboardContextType {
  blogData: TiptapDocument | undefined;
  setBlogData: React.Dispatch<React.SetStateAction<TiptapDocument | undefined>>;
}

interface DashboardProviderProps {
  children: ReactNode;
}

const initialContext: DashboardContextType = {
  blogData: undefined,
  setBlogData: () => undefined,
};

const DashboardContext = createContext<DashboardContextType>(initialContext);

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [blogData, setBlogData] = useState<TiptapDocument | undefined>(
    undefined,
  );

  useEffect(() => {
    socketClient.connect()

    return () => {
      socketClient.disconnect()
    }
  },[])

  return (
    <DashboardContext.Provider value={{ blogData, setBlogData }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
