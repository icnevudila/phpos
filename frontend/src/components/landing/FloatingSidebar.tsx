import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingSidebar(): JSX.Element {
  const [activeSection, setActiveSection] = useState("hero");

  const sections = [
    { id: "hero", label: "START" },
    { id: "features", label: "POWER" },
    { id: "workflow", label: "A DAY" },
    { id: "security", label: "DATA" },
    { id: "cta", label: "JOIN" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && scrollPos >= element.offsetTop && scrollPos < element.offsetTop + element.offsetHeight) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden xl:flex flex-col gap-4 items-end">
      {sections.map((section) => (
        <a 
          key={section.id} 
          href={`#${section.id}`}
          className="group flex items-center gap-3"
        >
          <AnimatePresence>
            {activeSection === section.id && (
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-500 bg-teal-50 px-2 py-1 rounded border border-teal-100"
              >
                {section.label}
              </motion.span>
            )}
          </AnimatePresence>
          <div className={`h-2 transition-all duration-300 rounded-full ${activeSection === section.id ? 'w-8 bg-teal-500' : 'w-2 bg-brand-border group-hover:bg-brand-border'}`} />
        </a>
      ))}
    </div>
  );
}
