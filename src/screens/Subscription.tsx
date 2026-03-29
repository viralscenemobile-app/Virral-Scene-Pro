import { Zap, Check, ShieldCheck, Crown, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    coins: "10 Daily",
    features: ["Standard Feed", "Basic AI Studio", "Community Challenges"],
    color: "bg-surface-container-high",
    textColor: "text-on-surface",
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    price: "9.99",
    coins: "50 Daily",
    features: ["Ad-Free Feed", "Priority AI Generation", "Exclusive Challenges", "Verified Badge", "4K Downloads"],
    color: "bg-primary",
    textColor: "text-background",
    icon: Crown,
    popular: true,
  },
  {
    id: "creator+",
    name: "Creator+",
    price: "24.99",
    coins: "200 Daily",
    features: ["Custom Templates", "Revenue Share", "Early Access", "Personal AI Model", "Unlimited Storage"],
    color: "bg-secondary",
    textColor: "text-on-secondary",
    icon: Sparkles,
  },
];

export function Subscription() {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  
  const activeSub = useQuery(api.subscriptions.getActive, userId ? { userId } : "skip" as any);
  const subscribe = useMutation(api.subscriptions.subscribe);
  const unsubscribe = useMutation(api.subscriptions.unsubscribe);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubscribe = async (tier: string) => {
    if (!userId) return;
    if (tier === "free") return;
    
    setIsSubscribing(tier);
    try {
      // In a real app, this would trigger a payment flow (Stripe, etc.)
      // For now, we'll just simulate a successful subscription
      await subscribe({
        userId,
        tier,
        durationDays: 30,
      });
      toast.success(`Successfully subscribed to ${tier.toUpperCase()}!`);
      navigate("/profile");
    } catch (e) {
      console.error("Subscription failed:", e);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setIsSubscribing(null);
    }
  };

  const handleUnsubscribe = async () => {
    if (!userId) return;
    try {
      await unsubscribe({ userId });
      toast.success("Successfully unsubscribed.");
      setShowConfirm(false);
    } catch (e) {
      toast.error("Failed to unsubscribe.");
    }
  };

  return (
    <main className="pt-24 px-4 pb-24 overflow-y-auto no-scrollbar h-screen bg-surface-container-lowest">
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-high p-6 rounded-3xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Unsubscribe</h3>
            <p className="mb-6 text-sm opacity-80">Are you sure you want to unsubscribe from {activeSub?.tier.toUpperCase()}? You will lose access to premium features.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl bg-surface-container-highest">Cancel</button>
              <button onClick={handleUnsubscribe} className="flex-1 py-3 rounded-xl bg-red-500 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
      <section className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">Upgrade Your Scene</h1>
        <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed">
          Unlock premium AI models, exclusive challenges, and monetize your content.
        </p>
      </section>

      <div className="space-y-6 max-w-md mx-auto">
        {TIERS.map((tier) => (
          <motion.div 
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative rounded-3xl p-6 border border-outline-variant/10 shadow-xl overflow-hidden",
              tier.color,
              tier.textColor
            )}
          >
            {tier.popular && (
              <div className="absolute top-4 right-4 bg-background text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <tier.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black font-headline">{tier.name}</h3>
                <p className="text-xs opacity-70">{tier.coins}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black font-headline">${tier.price}</span>
              <span className="text-sm opacity-70">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4 opacity-70" />
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe(tier.id)}
              disabled={activeSub?.tier === tier.id || isSubscribing !== null}
              className={cn(
                "w-full py-4 rounded-2xl font-black font-headline text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                tier.id === "free" ? "bg-surface-container-highest text-on-surface-variant" : "bg-white text-black",
                activeSub?.tier === tier.id && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubscribing === tier.id ? "Processing..." : activeSub?.tier === tier.id ? "Current Plan" : tier.id === "free" ? "Default" : "Subscribe Now"}
            </button>
            {activeSub?.tier === tier.id && tier.id !== "free" && (
              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full mt-4 py-3 rounded-2xl font-black font-headline text-sm uppercase tracking-widest transition-all active:scale-95 bg-red-500 text-white shadow-lg"
              >
                Unsubscribe
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <section className="mt-12 text-center pb-12">
        <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-4">Secure Checkout Powered by Stripe</p>
        <div className="flex justify-center gap-6 opacity-30 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
        </div>
      </section>
    </main>
  );
}
