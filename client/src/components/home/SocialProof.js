import React, { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);
    const motionValue = useSpring(0, { damping: 100, stiffness: 100 });
    const isInView = useInView(ref, { once: true });
  
    useEffect(() => {
      if (isInView) {
        motionValue.set(value);
      }
    }, [motionValue, isInView, value]);
  
    const displayValue = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString());
  
    return <motion.span ref={ref}>{displayValue}</motion.span>;
  };

export const SocialProof = () => {
    return (
        <section className="py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="p-10 sm:p-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    <p className="text-5xl sm:text-6xl font-bold text-white text-shadow">
                        <AnimatedNumber value={1206} />
                    </p>
                    <p className="text-lg text-indigo-200 mt-2">
                        assignments already planned
                    </p>
                </motion.div>
            </div>
        </section>
    );
}; 