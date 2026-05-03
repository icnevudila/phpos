import { motion } from "framer-motion";

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const RestorativeIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C7.58 2 4 5.58 4 10C4 13.39 6.11 16.29 9.07 17.43C9 17.61 9 17.81 9 18C9 20.21 10.79 22 13 22C15.21 22 17 20.21 17 18C17 17.81 17 17.61 16.93 17.43C19.89 16.29 22 13.39 22 10C22 5.58 18.42 2 14 2H12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7V13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 10H15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ExtractionIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 2L12 5L10 2H6L8 8H16L18 2H14Z" fill={color} fillOpacity="0.2"/>
    <path d="M8 8C8 8 7 14 12 14C17 14 16 8 16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14V22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 22H15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const OrthoIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12C4 12 6 7 12 7C18 7 20 12 20 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 12C4 12 6 17 12 17C18 17 20 12 20 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="7" y="10" width="2" height="4" rx="1" fill={color}/>
    <rect x="11" y="10" width="2" height="4" rx="1" fill={color}/>
    <rect x="15" y="10" width="2" height="4" rx="1" fill={color}/>
  </svg>
);

export const EndodonticIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 22V14M12 14C15 14 17 12 17 9C17 6 14.76 2 12 2C9.24 2 7 6 7 9C7 12 9 14 12 14Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <motion.path 
      d="M12 4V12" 
      stroke={color} 
      strokeWidth="1" 
      strokeDasharray="2 2"
      animate={{ strokeDashoffset: [0, 4] }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    />
  </svg>
);

export const CleaningIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M12 8V12L14 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.2" />
  </svg>
);

export const ImplantIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2V8M12 8L9 11M12 8L15 11M12 22V16M12 16L9 13M12 16L15 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="10" y="8" width="4" height="8" rx="1" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1" />
  </svg>
);

export const PeriodonticIcon = ({ size = 24, className = "", color = "currentColor" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12H19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 5V19" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 17L5 19M17 17L19 19M7 7L5 5M17 7L19 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
  </svg>
);
