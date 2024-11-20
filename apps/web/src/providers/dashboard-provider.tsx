import React, { createContext, useContext, useState } from "react";
import { ReactNode } from "@tanstack/react-router";

// First, let's define Tiptap's types properly:
interface TextContent {
  type: 'text';
  text: string;
}

interface NodeAttributes {
  level?: number;
  // Add other possible attributes here
}

interface Node {
  type: string;
  attrs?: NodeAttributes;
  content?: (Node | TextContent)[];
}

// This is the root document type that Tiptap uses
interface TiptapDocument {
  type: 'doc';
  content: Node[];
}

// Now let's update our context type
interface DashboardContextType {
    blogData: TiptapDocument | undefined;
    setBlogData: React.Dispatch<React.SetStateAction<TiptapDocument | undefined>>;
}

interface DashboardProviderProps {
    children: ReactNode;
}

const initialContext: DashboardContextType = {
    blogData: undefined,
    setBlogData: () => undefined
}

const DashboardContext = createContext<DashboardContextType>(initialContext);

export const DashboardProvider: React.FC<DashboardProviderProps> = ({children}) => {
    const [blogData, setBlogData] = useState<TiptapDocument | undefined>(undefined);

    return (
        <DashboardContext.Provider value={{blogData, setBlogData}}>
            {children}
        </DashboardContext.Provider>
    );
}

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}

// BONUS: Let's add some type guards to make working with the data safer!
export const isTiptapDocument = (data: any): data is TiptapDocument => {
    return (
        data &&
        typeof data === 'object' &&
        data.type === 'doc' &&
        Array.isArray(data.content)
    );
}

export const isTextContent = (node: any): node is TextContent => {
    return (
        node &&
        typeof node === 'object' &&
        node.type === 'text' &&
        typeof node.text === 'string'
    );
}

export const isNode = (data: any): data is Node => {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.type === 'string' &&
        (!data.content || Array.isArray(data.content)) &&
        (!data.attrs || typeof data.attrs === 'object')
    );
}