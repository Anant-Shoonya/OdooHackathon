import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, BookOpen, Star, Zap } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const stats = [
    { label: "Active Members", value: "2,847", icon: Users, color: "text-blue-400" },
    { label: "Total Skills Listed", value: "15,293", icon: BookOpen, color: "text-purple-400" },
    { label: "Average Rating", value: "4.8", icon: Star, color: "text-emerald-400" },
    { label: "Successful Swaps", value: "8,642", icon: Zap, color: "text-amber-400" },
  ];

  const steps = [
    {
      title: "Create Your Profile",
      description: "Set up your profile with the skills you can offer and the ones you want to learn.",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Find the Right Swap",
      description: "Browse through profiles and find someone whose offered skills match what you want to learn.",
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Skill Exchange Begins",
      description: "Connect, schedule sessions, and start learning from each other in a mutually beneficial way.",
      icon: Zap,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 container mx-auto px-6 py-20 text-center text-white">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              SkillSwap
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-4 text-blue-100">
              Exchange Skills, Build Community
            </p>
            <p className="text-lg md:text-xl mb-8 text-blue-200 max-w-2xl mx-auto">
              Connect with talented individuals in your area. Trade your expertise for new skills and grow together in a collaborative learning environment.
            </p>
            <Button
              onClick={() => setLocation("/home")}
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Swapping Skills
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
