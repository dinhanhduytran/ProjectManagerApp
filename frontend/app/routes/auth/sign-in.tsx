import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useLogInMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-context";
import { Loader2 } from "lucide-react";

type SignInFormData = z.infer<typeof signInSchema>;

function SignIn() {
  // hook to manage form state and validation
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema), // using zod for validation, resolver is a function that handles validation
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { login } = useAuth();

  const { mutate, isPending } = useLogInMutation(); // custom hook to handle sign-in mutation, isPending is a boolean that indicates if the mutation is in progress

  const handleOnSubmit = (values: SignInFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        console.log("data", data);
        toast.success("Logged in successfully!", {
          description: "Welcome back to Planora.",
        });
        form.reset(); // reset the form after successful submission
        window.location.href = "/dashboard"; // redirect to dashboard
      },
      onError: (error) => {
        const errorMessage =
          (error as any)?.response?.data?.message || error.message;
        toast.error(errorMessage, {
          description: "There was an issue logging in. Please try again.",
        });
        console.error("Error during sign-in:", error);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="mb-4 text-center space-y-1">
          <CardTitle className="text-2xl font-bold"> Welcome back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Please sign in to your account to continue with Planora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-4"
            >
              {/* email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to={"/forgot-password"}
                        className="text-sm text-secondary hover:underline font-regular"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={"/sign-up"}
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignIn;
