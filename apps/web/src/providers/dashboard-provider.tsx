import React, { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "@tanstack/react-router";
import { socketClient } from "@/utils/socket";
import { ModelsType, TiptapDocument } from "@dumpanddone/types";

interface DashboardContextType {
  blogData: TiptapDocument;
  setBlogData: (data: TiptapDocument | ((prev: TiptapDocument) => TiptapDocument)) => void;
  selectedModel: ModelsType;
  setSelectedModel: (model: ModelsType) => void;
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
  selectedModel: "claude",
  setSelectedModel: () => undefined
};

const DashboardContext = createContext<DashboardContextType>(initialContext);

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [blogData, setBlogData] = useState<TiptapDocument>(initialBlogData);
  const [selectedModel, setSelectedModel] = useState<ModelsType>("claude");

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
        selectedModel, 
        setSelectedModel 
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