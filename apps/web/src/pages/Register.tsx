import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input, Label, Separator, Button,
} from "@dumpanddone/ui"
import { Loader2, User } from 'lucide-react'
import { Link } from "@tanstack/react-router"
import { Formik, Form, Field } from "formik"
import * as z from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const validate = (values: RegisterFormData) => {
  try {
    registerSchema.parse(values)
    return {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.reduce((acc, issue) => {
        acc[issue.path[0]] = issue.message
        return acc
      }, {})
    }
  }
}

export function Register() {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      setIsLoading(true)
      console.log(values)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <Button className="w-full" variant="outline" disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Sign up with Google
            </Button>
            <Button className="w-full" variant="outline" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
              Sign up with GitHub
            </Button>
          </div>
          <Separator className="my-4" />
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validate={validate}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ errors, touched, isValid }) => (
              <Form className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                  {touched.name && errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    disabled={isLoading}
                  />
                  {touched.password && errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    disabled={isLoading}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
                <CardFooter className="px-0 pt-6">
                  <Button 
                    className="w-full" 
                    type="submit" 
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Processing..." : "Register"}
                  </Button>
                </CardFooter>
              </Form>
            )}
          </Formik>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}