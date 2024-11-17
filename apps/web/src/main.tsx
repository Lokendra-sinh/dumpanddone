import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.ts";
import './index.css'
import '@dumpanddone/ui/globals.css'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { trpc } from "./utils/trpc.ts";
import { httpBatchLink } from "@trpc/client";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:4000/trpc"
    })
  ]
})

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>
);
