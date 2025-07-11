import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center flex-wrap gap-8">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={32} className="text-indigo-600" />
                        <span className="text-2xl font-bold text-gray-800">SchoolBag</span>
                    </div>
                    <div className="flex gap-6 items-center">
                        <Link to="/login" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">
                            Sign in
                        </Link>
                        <Link to="/register" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>&copy; 2024 SchoolBag. Built by LahoumaBarik Team. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}; 