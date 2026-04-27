import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Shield, Eye, Database, Share2, Lock, UserCheck, Bell, Mail } from 'lucide-react';
import { LogoMark } from '@/components/Logo.jsx';

const PrivacyPage = () => {
  const effectiveDate = "April 27, 2026";
  
  const sections = [
    { id: 'collection', title: 'Data Collection', icon: Database },
    { id: 'usage', title: 'How We Use Data', icon: Eye },
    { id: 'sharing', title: 'Data Sharing', icon: Share2 },
    { id: 'security', title: 'Security Measures', icon: Lock },
    { id: 'rights', title: 'Your Rights', icon: UserCheck },
    { id: 'updates', title: 'Policy Updates', icon: Bell },
    { id: 'contact', title: 'Contact Us', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans selection:bg-accent/20">
      <Helmet>
        <title>Privacy Policy - FocusFlow</title>
      </Helmet>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center bg-[var(--card)] rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <LogoMark size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">FocusFlow</span>
          </Link>
          <Link 
            to="/signup" 
            className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Signup
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-1">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-3">Sections</h3>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card)] transition-all group"
                >
                  <section.icon className="w-4 h-4 group-hover:text-accent transition-colors" />
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 max-w-3xl">
            <div className="mb-12">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span>Last Updated:</span>
                <span className="font-semibold text-[var(--text-primary)]">{effectiveDate}</span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-12">
              
              <section id="collection" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    We collect information to provide a better experience for all our users. This includes:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, and profile preferences.</li>
                    <li><strong>Usage Data:</strong> Focus session durations, task titles, and app interactions.</li>
                    <li><strong>Technical Data:</strong> IP address, device type, and operating system for security and optimization.</li>
                  </ul>
                </div>
              </section>

              <section id="usage" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  2. How We Use Your Information
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>We use the data we collect for purposes including:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Providing and maintaining the FocusFlow service.</li>
                    <li>Generating productivity analytics and personal insights.</li>
                    <li>Communicating important updates and security alerts.</li>
                    <li>Improving app performance and developing new features.</li>
                  </ul>
                </div>
              </section>

              <section id="security" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  3. Data Security
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    We implement industry-standard security measures to protect your data. All communication between your device and our servers is encrypted using SSL/TLS technology. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>
              </section>

              <section id="rights" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  4. Your Rights & Choices
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Access the personal data we hold about you.</li>
                    <li>Request the correction of inaccurate data.</li>
                    <li>Delete your account and all associated data at any time.</li>
                    <li>Opt-out of non-essential communications.</li>
                  </ul>
                </div>
              </section>

              <section id="contact" className="scroll-mt-24 border-t border-[var(--border)] pt-12">
                <h2 className="text-2xl font-bold mb-4">Questions about your privacy?</h2>
                <p className="text-[var(--text-muted)] mb-6">
                  Our privacy team is here to help. Reach out to us at <span className="text-[var(--text-primary)] font-medium">privacy@focusflow.app</span>.
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-12 bg-[var(--card)]/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} FocusFlow. Protecting your focus and your data.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
