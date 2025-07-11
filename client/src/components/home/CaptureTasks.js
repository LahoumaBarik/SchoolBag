import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskItem = ({ title, subject, priority, status, delay }) => {
    const priorityClasses = { high: 'bg-red-400', medium: 'bg-yellow-400', low: 'bg-green-400' };
    const statusClasses = { 
        completed: 'bg-green-500', 
        'in-progress': 'bg-blue-500', 
        pending: 'bg-gray-400' 
    };

    return (
        <motion.div 
            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: delay }}
            viewport={{ once: true }}
        >
            <div className={`w-2.5 h-10 rounded-full ${priorityClasses[priority]}`} />
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-500">{subject}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${statusClasses[status]}`} />
        </motion.div>
    );
};

const listItems = [
    "Context-aware note templates",
    "Smart deadline reminders",
    "Priority-based organization",
    "Real-time collaboration"
];

const listVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      }
    })
};

export const CaptureTasks = () => {
    return (
        <section className="py-20 sm:py-28 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Capture tasks at the speed of thought
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Our smart interface learns how you work and helps you organize everything from assignments to exam preparation with context-aware templates and intelligent reminders.
                    </p>
                    <ul className="space-y-4">
                        {listItems.map((item, index) => (
                             <motion.li 
                                key={index} 
                                className="flex items-center gap-3 text-gray-700"
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={listVariants}
                            >
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                <span>{item}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
                <div className="space-y-4">
                    <TaskItem title="Linear Algebra Final Exam" subject="Mathematics • Due Dec 15" priority="high" status="completed" delay={0.2} />
                    <TaskItem title="Research Paper Draft" subject="History • Due Dec 12" priority="medium" status="in-progress" delay={0.4} />
                    <TaskItem title="Chemistry Lab Report" subject="Chemistry • Due Dec 18" priority="low" status="pending" delay={0.6} />
                </div>
            </div>
        </section>
    );
}; 