import React, { createContext, useContext, useState } from "react";
import { GeneratedBlogType } from '@dumpanddone/types/src'
import { ReactNode } from "@tanstack/react-router";

interface DashboardContextType {
    blogData: GeneratedBlogType | undefined
    setBlogData: React.Dispatch<React.SetStateAction<GeneratedBlogType | undefined>>
}

interface DashboardProviderProps {
    children: ReactNode
}

const initialContext: DashboardContextType = {
    blogData: undefined,
    setBlogData: () => undefined
}

const DashboardContext = createContext<DashboardContextType>(initialContext)

export const DashboardProvider:React.FC<DashboardProviderProps> = ({children}) => {

    const [blogData, setBlogData] = useState<GeneratedBlogType | undefined>(undefined)

    return (
        <DashboardContext.Provider value={{blogData, setBlogData}}>
            {children}
        </DashboardContext.Provider>
    )
}



export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}