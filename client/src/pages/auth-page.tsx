import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  
  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: loginForm.email,
      password: loginForm.password,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }
    
    registerMutation.mutate({
      email: registerForm.email,
      username: registerForm.username,
      password: registerForm.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sports Betting Simulator
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Master your betting strategy with AI-powered predictions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Enter your password"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                  
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Demo: email: demo@example.com, password: demo123
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Create a password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Confirm your password"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending || registerForm.password !== registerForm.confirmPassword}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Hero Section */}
        <div className="text-center lg:text-left space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Perfect Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Betting Strategy
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mt-4">
              Practice with AI-powered predictions and real sports data without risking real money
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">AI Predictions</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Smart recommendations powered by advanced algorithms
              </p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Real Data</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Live sports data from NBA, NFL, MLB, and NHL
              </p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Virtual Bankroll</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Start with $10,000 virtual currency to practice
              </p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <BarChart3 className="h-5 w-5" />
                <span className="font-semibold">Analytics</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track your performance and improve your strategy
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Risk-Free Learning
            </h3>
            <p className="text-blue-800 dark:text-blue-400">
              Master betting strategies, test different approaches, and learn from AI insights without any financial risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}