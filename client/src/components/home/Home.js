import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { Header } from './Header';
import { Hero } from './Hero';
import { Features } from './Features';
import { CaptureTasks } from './CaptureTasks';
import { SocialProof } from './SocialProof';
import { Cta } from './Cta';
import { Footer } from './Footer';

const Home = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div className="bg-white text-gray-800 font-sans antialiased">
      <Header />
      <motion.div style={{ opacity }} className="fixed inset-x-0 top-20 h-24 bg-gradient-to-b from-white to-transparent z-10" />
      
      <main>
        <Hero />
        <Features />
        <CaptureTasks />
        <SocialProof />
        <Cta />
      </main>

      <Footer />
    </div>
  );
};

export default Home; 