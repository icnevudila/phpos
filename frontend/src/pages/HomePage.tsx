import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' }
];

const footerLinks = [
  {
    category: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Integrations', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Changelog', href: '#' }
    ]
  },
  {
    category: 'Solutions',
    links: [
      { label: 'Startups', href: '#' },
      { label: 'Enterprise', href: '#' },
      { label: 'DSOs', href: '#' },
      { label: 'Specialists', href: '#' }
    ]
  },
  {
    category: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Customer Stories', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Webinars', href: '#' }
    ]
  },
  {
    category: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Legal', href: '#' }
    ]
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-[family-name:var(--font-body)] text-[var(--color-ink-2)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* N1b SaaS three-section Nav */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-240 ${
          scrolled
            ? 'bg-[color-mix(in_oklch,var(--color-paper)_80%,transparent)] backdrop-blur-md border-b border-[var(--color-rule)] shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Brand */}
          <div className="justify-self-start font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-[var(--color-ink)] flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]" />
            DentQL
          </div>

          {/* Center Links (Desktop only) */}
          <nav className="justify-self-center hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="justify-self-end flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors hidden sm:block"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="h-9 px-4 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* H1 Marquee Hero */}
        <section className="relative min-h-[85vh] flex flex-col justify-end pb-24 px-6 max-w-[1400px] mx-auto overflow-hidden">
          {/* Abstract Teal Curve Background element */}
          <div className="absolute top-0 right-0 -z-10 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-[var(--color-secondary)] opacity-20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="max-w-4xl pt-40 reveal is-in">
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.05] tracking-tight text-[var(--color-ink)]">
              Revolutionize your dental practice with DentQL.
            </h1>
            <p className="mt-8 text-xl text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
              Streamline workflows, enhance communication, and empower your team with our all-in-one cloud platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => navigate('/login')}
                className="h-12 px-8 rounded-full bg-[var(--color-accent)] text-white text-base font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-[var(--color-accent)]/20"
              >
                See it in action
              </button>
              <button className="h-12 px-8 rounded-full bg-white text-[var(--color-ink)] border border-[var(--color-rule)] text-base font-semibold hover:bg-[var(--color-paper-subtle)] transition-colors active:scale-95">
                Read the docs
              </button>
            </div>
          </div>
        </section>

        {/* Example Content Section to show off the generous padding and geometric structure */}
        <section className="py-32 px-6 bg-[var(--color-paper-subtle)]">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-ink)] leading-tight tracking-tight">
                  Everything you need, nothing you don't.
                </h2>
                <p className="mt-6 text-lg text-[var(--color-ink-2)] leading-relaxed">
                  We stripped away the legacy bloat to build a practice management system that actually feels good to use. 
                  Zero training required.
                </p>
                <ul className="mt-8 space-y-4">
                  {['Cloud-based imaging & charting', 'Patient self-scheduling', 'Integrated payment processing'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[var(--color-ink)] font-medium">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-black/5 border border-[var(--color-rule)] h-[400px] flex items-center justify-center">
                <p className="text-[var(--color-ink-2)] text-sm font-mono uppercase tracking-widest">[ UI Mockup Placeholder ]</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Ft3 Index Footer with Dark Graphite background */}
      <footer className="bg-[var(--color-graphite)] text-[var(--color-graphite-ink)] pt-20 pb-10 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <div className="font-[family-name:var(--font-display)] font-bold text-xl tracking-tight text-white flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]" />
                DentQL
              </div>
              <p className="text-sm text-[var(--color-graphite-rule)] max-w-xs">
                The modern operating system for ambitious dental practices.
              </p>
            </div>
            
            {footerLinks.map((col) => (
              <div key={col.category}>
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-graphite-rule)] mb-6 font-semibold">
                  {col.category}
                </p>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-[color-mix(in_oklch,var(--color-graphite-ink)_80%,transparent)] hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[var(--color-graphite-rule)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-graphite-rule)]">
            <p>© {new Date().getFullYear()} DentQL Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
