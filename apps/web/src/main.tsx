import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.ts";
import "./index.css";
import "@dumpanddone/ui/globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { trpc } from "./utils/trpc.ts";
import { httpBatchLink } from "@trpc/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_AUTH_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:4000/trpc",
      fetch(url, options) {
        console.log("url and options", url, options);
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

export const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_AUTH_ID}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  </GoogleOAuthProvider>,
);
