"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ ease: "easeInOut", duration: 0.25 }}
      className="w-full flex-1 flex flex-col min-h-0"
    >
      {children}
    </motion.div>
  );
}
