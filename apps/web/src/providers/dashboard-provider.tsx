import React, { createContext, useContext, useState } from "react";
import { ReactNode } from "@tanstack/react-router";
import { TiptapDocument } from "../types/tiptap-blog"


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

