"use client";
import { motion } from "framer-motion";
import * as React from "react";
export default function HeroBar({children}:{children?:React.ReactNode}) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md h-72 overflow-hidden">
      <motion.div
        className="absolute -top-16 left-24 h-64 w-64 rounded-full"
        style={{ background:"radial-gradient(closest-side, rgba(0,160,255,.35), transparent 70%)" }}
        animate={{ x:[0,20,-10,0], y:[0,10,-15,0] }}
        transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
      />
      {children}
    </div>
  );
}
