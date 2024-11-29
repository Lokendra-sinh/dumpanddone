import { useEffect } from "react";
import { GithubCallbackRoute } from "@/routes/routes";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@dumpanddone/ui"

export const GithubCallback = () => {
  const { toast } = useToast()
  const { code } = useSearch({ from: GithubCallbackRoute.id });
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser)

  const githubLoginMutation = trpc.githubLogin.useMutation({
    onSuccess: (res) => {
        console.log("RES from github login is", res)
        setUser(res.user)
        navigate({
            to: '/dashboard'
        })
    },
    onError: (e) => {
        console.error("Error from github login", e)
        toast({
            variant: "default",
            title: e.message || "Error occured while gtihub login"
        })
    }
  })

  useEffect(() => {
    if(code){
    githubLoginMutation.mutate({accessCode: code})
    }
  },[])

  return <div>Loading...</div>;
};
