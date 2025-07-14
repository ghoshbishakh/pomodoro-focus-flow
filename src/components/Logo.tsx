import { cn } from "@/lib/utils";
import * as React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("h-8 w-8", className)}
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1E90FF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00BFFF', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Concentric circles for focus */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad1)" strokeWidth="4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#1E90FF" strokeWidth="2" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="#00BFFF" strokeWidth="1" />
      {/* Flowing lines for flow */}
      <path d="M30,50 Q50,30 70,50" fill="none" stroke="#1E90FF" strokeWidth="2" />
      <path d="M30,60 Q50,40 70,60" fill="none" stroke="#00BFFF" strokeWidth="2" />
    </svg>
  );
}
