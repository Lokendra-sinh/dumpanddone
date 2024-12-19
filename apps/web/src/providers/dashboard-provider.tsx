import React, { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "@tanstack/react-router";
import { socketClient } from "@/socket/socket-client";
import {  TiptapDocument } from "@dumpanddone/types";

interface DashboardContextType {
  blogData: TiptapDocument;
  setBlogData: (data: TiptapDocument | ((prev: TiptapDocument) => TiptapDocument)) => void;
}

interface DashboardProviderProps {
  children: ReactNode;
}

const initialBlogData: TiptapDocument = {
  type: "doc",
  content: [{
    type: "paragraph",
    content: [{
      type: "text",
      text: ""
    }]
  }]
};

const initialContext: DashboardContextType = {
  blogData: initialBlogData,
  setBlogData: () => undefined,
};

const DashboardContext = createContext<DashboardContextType>(initialContext);

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [blogData, setBlogData] = useState<TiptapDocument>(initialBlogData);

  useEffect(() => {
    socketClient.connect();

    return () => {
      socketClient.disconnect();
    };
  }, []);

  return (
    <DashboardContext.Provider 
      value={{ 
        blogData, 
        setBlogData, 
      }}
    >
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