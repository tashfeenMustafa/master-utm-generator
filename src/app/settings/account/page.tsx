"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Settings2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUser, updateUser, getLinks, getConnections } from "@/lib/storage";
import type { UserProfile, UserPlan } from "@/lib/types";

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [linksCount, setLinksCount] = useState(0);
  const [connCount, setConnCount] = useState(0);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const data = getUser();
    setUser(data);
    setName(data.name);
    setEmail(data.email);
    setLinksCount(getLinks().length);
    setConnCount(getConnections().length);
  }, []);

  if (!user) return null;

  function handleSaveProfile() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const updated = updateUser({ name, email });
    setUser(updated);
    toast.success("Profile updated");
  }

  function handleSwitchPlan(plan: UserPlan) {
    const isPremium = plan !== "free";
    const updated = updateUser({ plan, isPremium });
    setUser(updated);
    toast.success(`Plan switched to ${plan.toUpperCase()}`);
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-950">Account Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your profile, subscription plan, and workspace usage.
          </p>
        </div>
        <Badge variant={user.isPremium ? "default" : "outline"} className={user.isPremium ? "bg-indigo-600 h-7 px-3 text-xs uppercase tracking-wider font-black" : "h-7 px-3 text-xs uppercase tracking-wider font-bold"}>
          {user.plan} Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-indigo-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-indigo-50 py-4">
              <CardTitle className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                <User className="size-5 text-indigo-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input 
                    id="user-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input 
                    id="user-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-green-600" />
                  Identity Verified
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-indigo-50 px-6 py-3">
              <Button onClick={handleSaveProfile} size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold ml-auto">
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <Card className={`border-2 transition-all ${user.plan === "free" ? "border-indigo-600 shadow-md ring-4 ring-indigo-50" : "border-indigo-100 opacity-80 hover:opacity-100"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-black text-indigo-950">Free</CardTitle>
                  <CardDescription>Perfect for individual marketers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="text-3xl font-black text-indigo-950">$0<span className="text-sm font-normal text-muted-foreground"> / month</span></div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                      Unlimited UTM Links
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                      5 Platform Types
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                      Basic Data Export
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={user.plan === "free" ? "outline" : "ghost"} 
                    className="w-full font-bold"
                    disabled={user.plan === "free"}
                    onClick={() => handleSwitchPlan("free")}
                  >
                    {user.plan === "free" ? "Current Plan" : "Downgrade"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className={`border-2 relative overflow-hidden transition-all ${user.plan === "pro" ? "border-indigo-600 shadow-md ring-4 ring-indigo-50" : "border-indigo-100 hover:border-indigo-200 shadow-lg shadow-indigo-100/20"}`}>
                {user.plan !== "pro" && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-bl-lg">
                    Recommended
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-black text-indigo-950 flex items-center gap-2">
                    Pro
                    <Zap className="size-5 text-amber-500 fill-amber-500" />
                  </CardTitle>
                  <CardDescription>For power users & agencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="text-3xl font-black text-indigo-950">$19<span className="text-sm font-normal text-muted-foreground"> / month</span></div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0" />
                      Everything in Free
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 font-bold">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0" />
                      Unlimited Source Types
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0" />
                      Advanced Analytics
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle2 className="size-4 text-indigo-600 shrink-0" />
                      Team Shared Libraries
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full font-bold shadow-lg ${user.plan === "pro" ? "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"}`}
                    disabled={user.plan === "pro"}
                    onClick={() => handleSwitchPlan("pro")}
                  >
                    {user.plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="size-4 text-indigo-600" />
                Usage Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generated Links</span>
                <span className="font-bold text-indigo-950">{linksCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cloud Connections</span>
                <span className="font-bold text-indigo-950">{connCount} / {user.isPremium ? "∞" : "3"}</span>
              </div>
              <div className="pt-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${user.isPremium ? 10 : Math.min(100, (connCount / 3) * 100)}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-50 bg-indigo-50/20 shadow-none border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <CreditCard className="size-4 text-indigo-600" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are currently using the **local-only** mode. All data is stored in your browser. 
                Upgrade to Pro to enable cloud sync and team collaboration.
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto text-indigo-600 font-bold text-xs">
                View billing history
              </Button>
            </CardContent>
          </Card>

          <div className="px-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Shortcuts</h4>
            <ul className="space-y-3">
              <li>
                <a href="/settings/connections" className="flex items-center gap-2 text-xs font-bold text-indigo-900 hover:text-indigo-600 transition-colors group">
                  <Settings2 className="size-3.5 text-slate-400 group-hover:text-indigo-600" />
                  Configure Data Sources
                </a>
              </li>
              <li>
                <a href="/health-checker" className="flex items-center gap-2 text-xs font-bold text-indigo-900 hover:text-indigo-600 transition-colors group">
                  <ShieldCheck className="size-3.5 text-slate-400 group-hover:text-indigo-600" />
                  Audit Library Health
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
