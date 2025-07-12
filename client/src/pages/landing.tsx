import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, Zap, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [, setLocation] = useLocation();

  const steps = [
    {
      title: "Create Your Profile",
      description:
        "Set up your profile with the skills you can offer and the ones you want to learn.",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Find the Right Swap",
      description:
        "Browse through profiles and find someone whose offered skills match what you want to learn.",
      icon: BookOpen,
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Skill Exchange Begins",
      description:
        "Connect, schedule sessions, and start learning from each other in a mutually beneficial way.",
      icon: Zap,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const testimonials = [
    {
      quote:
        "SkillSwap helped me find an amazing coding mentor while teaching graphic design in return. It's more than an app — it's a movement.",
      author: "Aayushi Sharma",
      location: "Jaipur",
    },
    {
      quote:
        "I swapped my marketing skills for UX design guidance. The experience was smooth and meaningful!",
      author: "Krishna Yadav",
      location: "Delhi",
    },
    {
      quote:
        "As a college student, SkillSwap gave me real-world learning while helping others. Totally love it!",
      author: "Ritika Patel",
      location: "Bangalore",
    },
  ];

  const [index, setIndex] = useState(0);
  const testimonial = testimonials[index];

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 container mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              SkillSwap
            </h1>
            <p className="text-2xl md:text-3xl font-medium mb-4 text-purple-100">
              Exchange Skills, Build Community
            </p>
            <p className="text-lg md:text-xl mb-8 text-purple-200 max-w-xl">
              Connect with talented individuals. Trade your expertise for new skills and grow together in a collaborative learning environment.
            </p>
            <Button
              onClick={() => setLocation("/home")}
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Swapping Skills
            </Button>
          </motion.div>

          <motion.img
            src="https://illustrations.popsy.co/gray/presentation.svg"
            alt="Hero Visual"
            className="w-full max-w-lg mx-auto md:mx-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div
                  className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6 text-center relative">
          <Quote className="mx-auto mb-6 w-12 h-12 text-purple-400" />

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto mb-6 text-purple-100">
                “{testimonial.quote}”
              </p>
              <p className="text-lg text-purple-300">
                — {testimonial.author}, {testimonial.location}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition"
            >
              <ArrowLeft className="w-5 h-5 text-purple-200" />
            </button>
            <button
              onClick={next}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition"
            >
              <ArrowRight className="w-5 h-5 text-purple-200" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}