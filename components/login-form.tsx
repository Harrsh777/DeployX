import { useState } from "react";
import { supabase } from "@/lib/supabaseclient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      console.log("Logged in successfully!", data);
      window.location.href = "/Main";
    }
  };

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: "http://localhost:3000/Main" },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Apple or Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin("apple")}>
                  Login with Apple
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin("google")}>
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm">
                <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
              </div>
              <div className="grid gap-6">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don't have an account? <a href="/Signup" className="underline">Sign up</a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
