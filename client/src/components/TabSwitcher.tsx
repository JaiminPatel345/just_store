import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { UploadCloud, FileVideo } from 'lucide-react';

const TabSwitcher: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { path: '/', label: 'Upload File', icon: UploadCloud },
    { path: '/retrieve', label: 'Retrieve File', icon: FileVideo },
  ];

  return (
    <div className="flex justify-center mb-10">
      <div className="bg-[#2a2a2a] p-1.5 rounded-full flex items-center shadow-lg border border-gray-800 relative">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={clsx(
                "relative z-10 px-6 py-2.5 rounded-full text-sm font-medium flex items-center space-x-2 transition-colors duration-200",
                isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TabSwitcher;
