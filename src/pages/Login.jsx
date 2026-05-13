import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { LogIn, ScanLine } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
    const navigate = useNavigate();

    const sendAdminNotification = (userData) => {
        const templateParams = {
            to_email: "22331a1276@mvgrce.edu.in",
            user_email: userData.email,
            user_name: userData.displayName,
            login_time: new Date().toLocaleString(),
        };

        // Replace these with your EmailJS credentials in .env
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
            emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
                .then((response) => {
                    console.log("Email sent successfully!", response.status, response.text);
                })
                .catch((err) => {
                    console.error("Failed to send email:", err);
                });
        } else {
            console.warn("EmailJS credentials not fully configured in .env");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            toast({
                title: "Login Successful",
                description: `Welcome, ${user.displayName}!`,
            });

            // Send notification email
            sendAdminNotification(user);

            // Redirect to dashboard
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Error signing in with Google:", error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message,
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl border border-border shadow-soft">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
                        <ScanLine className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                        Digitization System
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Automated Student Marks Digitization System.
                        Please sign in to continue.
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                    <Button
                        onClick={handleGoogleSignIn}
                        className="w-full h-12 text-lg font-semibold gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm transition-all"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Sign in with Google
                    </Button>

                    <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Secure Authentication
                            </span>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground">
                    By signing in, you agree to our Terms of Service <br />
                    and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default Login;
