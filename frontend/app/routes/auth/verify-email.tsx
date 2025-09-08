import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { toast } from "sonner";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setIsSuccess(false);
    } else {
      mutate(
        { token },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (error) => {
            const errorMessage =
              (error as any)?.response?.data?.message || error.message;
            setIsSuccess(false);
            console.error("Error verifying email:", error);
            toast.error(errorMessage, {
              description:
                "There was an issue verifying your email. Please try again.",
            });
          },
        }
      );
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2-xl font-semibold">Verify Email</h1>
      <p className="text-sm text-slate-500 mb-4">Verify your email...</p>

      <Card className="w-full max-w-md">
        <CardHeader className=""></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            {/* Show loading spinner while verifying */}
            {isVerifying ? ( // show loading spinner while verifying
              <>
                <Loader className="w-10 h-10 text-slate-500 animate-spin mb-4" />
                <p className="text-sm text-primary text-center ">
                  Please wait while we verify your email...
                </p>
              </>
            ) : isSuccess ? ( // show success message if verified
              <>
                <CheckCircle className="w-10 h-10 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">Email Verified</h3>
                <p className="text-sm text-secondary text-center ">
                  Your email has been verified successfully
                </p>
                <Link to="/sign-in" className="text-sm">
                  <Button variant="outline" className="text-slate-600 mt-6">
                    Back to Sign in
                  </Button>
                </Link>
              </>
            ) : (
              // show error message if not verified
              <>
                <XCircle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold">Email Not Verified</h3>
                <p className="text-sm text-red-400 text-center">
                  Your email verification link is invalid or has expired. Please
                  request a new verification email.
                </p>
                <Link to="/sign-in" className="text-sm">
                  <Button variant="outline" className="text-slate-600 mt-6">
                    Back to Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;
