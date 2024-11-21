// import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { Button } from "@dumpanddone/ui"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Switch,
} from "@dumpanddone/ui"
import { Mail, User, Loader2 } from 'lucide-react'



export function Login() {
    const [isRegister, setIsRegister] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
  
    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault()
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsLoading(false)
    }
    console.log("inside login");

    // const login = useGoogleLogin({
    //     onSuccess: (tokenResponse) => {
    //         console.log("Token res is", tokenResponse);
    //     }
    // })

  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center'>
   <Card className="w-[400px] bg-gradient-to-b from-neutral-950 from-40% via-neutral-900 via-50%  to-neutral-950 to-100%">
      <CardHeader>
        <div className="flex items-center justify-between my-2">
          <CardTitle>{isRegister ? "Register" : "Login"}</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="auth-mode" className="text-sm">Register</Label>
            <Switch
              id="auth-mode"
              checked={isRegister}
              onCheckedChange={setIsRegister}
              disabled={isLoading}
            />
          </div>
        </div>
        <CardDescription>
          {isRegister
            ? "Create a new account to get started."
            : "Welcome back! Please login to your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <Button className="w-full" variant="outline" disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            {isRegister ? "Sign up" : "Login"} with Google
          </Button>
          <Button className="w-full" variant="outline" disabled={isLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            {isRegister ? "Sign up" : "Login"} with GitHub
          </Button>
        </div>
        <Separator className="my-4" />
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            {isRegister && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" disabled={isLoading} />
              </div>
            )}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input className='shadow-[inset_0px_0px_15px_1px_#0034]' id="email" placeholder="m@example.com" type="email" disabled={isLoading} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" disabled={isLoading} />
            </div>
            {isRegister && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" disabled={isLoading} />
              </div>
            )}
          </div>
          <CardFooter className="px-0 pt-6">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isRegister ? (
                <User className="mr-2 h-4 w-4" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {isLoading
                ? "Processing..."
                : isRegister
                ? "Register"
                : "Login"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}