import React from 'react';
import { ShieldCheck, CalendarClock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <ShieldCheck size={28} className="text-indigo-500" />,
    title: "Secure Sign-in",
    description: "Your academic data is protected with enterprise-grade security and encrypted storage."
  },
  {
    icon: <Target size={28} className="text-indigo-500" />,
    title: "Smart Task Management",
    description: "Organize assignments, exams, and projects with intelligent prioritization and due date tracking."
  },
  {
    icon: <CalendarClock size={28} className="text-indigo-500" />,
    title: "Calendar Heat-map View",
    description: "Visualize your workload with an intuitive calendar that shows task density and helps you plan ahead."
  }
];

const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
};

export const Features = () => {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Everything you need to succeed
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            A comprehensive toolset designed to help you stay organized and on track.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="p-8 bg-gray-50 rounded-2xl shadow-sm border border-transparent hover:border-indigo-200 hover:shadow-lg transition-all"
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={featureVariants}
            >
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 