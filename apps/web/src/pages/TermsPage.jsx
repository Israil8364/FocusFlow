import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Scale, ShieldCheck, UserCheck, Lock, AlertCircle, FileText, Mail, Gavel } from 'lucide-react';
import { LogoMark } from '@/components/Logo.jsx';

const TermsPage = () => {
  const effectiveDate = "April 27, 2026";
  
  const sections = [
    { id: 'introduction', title: 'Introduction', icon: FileText },
    { id: 'eligibility', title: 'User Eligibility', icon: UserCheck },
    { id: 'accounts', title: 'Account Responsibilities', icon: Lock },
    { id: 'usage', title: 'Acceptable Use Policy', icon: ShieldCheck },
    { id: 'ip', title: 'Intellectual Property', icon: Scale },
    { id: 'liability', title: 'Limitation of Liability', icon: AlertCircle },
    { id: 'termination', title: 'Termination', icon: Gavel },
    { id: 'contact', title: 'Contact Us', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans selection:bg-accent/20">
      <Helmet>
        <title>Terms and Conditions - FocusFlow</title>
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
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-3">On this page</h3>
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
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Terms and Conditions</h1>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span>Effective Date:</span>
                <span className="font-semibold text-[var(--text-primary)]">{effectiveDate}</span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-12">
              
              <section id="introduction" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-accent" /> 1. Introduction
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    Welcome to <strong>FocusFlow</strong> ("we," "our," or "us"). These Terms and Conditions govern your use of the FocusFlow productivity application and website (the "Service").
                  </p>
                  <p>
                    By accessing or using FocusFlow, you agree to be bound by these terms. If you do not agree with any part of these terms, you must not use our Service.
                  </p>
                </div>
              </section>

              <section id="eligibility" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-accent" /> 2. User Eligibility
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    To use FocusFlow, you must be at least 13 years old (or the minimum age of digital consent in your country). By creating an account, you represent that you meet this requirement and that your use of the Service does not violate any applicable law or regulation.
                  </p>
                </div>
              </section>

              <section id="accounts" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-accent" /> 3. Account Responsibilities
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials, including your password. You agree to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide accurate and complete information during registration.</li>
                    <li>Notify us immediately of any unauthorized use of your account.</li>
                    <li>Accept full responsibility for all activities that occur under your account.</li>
                  </ul>
                </div>
              </section>

              <section id="usage" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-accent" /> 4. Acceptable Use Policy
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>You agree not to use FocusFlow for any unlawful purpose or to:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                    <li>Attempt to gain unauthorized access to our systems or user accounts.</li>
                    <li>Upload or transmit any malicious code, viruses, or harmful software.</li>
                    <li>Scrape, crawl, or use automated systems to extract data from the Service without permission.</li>
                  </ul>
                </div>
              </section>

              <section id="ip" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-accent" /> 5. Intellectual Property Rights
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    The Service and its original content (excluding user-provided data), features, and functionality are and will remain the exclusive property of FocusFlow and its licensors. Our trademarks, logos, and branding may not be used without prior written consent.
                  </p>
                </div>
              </section>

              <section id="privacy" className="scroll-mt-24 p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                <h2 className="text-xl font-bold mb-3">Privacy & Data Handling</h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Your privacy is important to us. Please review our <Link to="/privacy" className="text-accent font-medium hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              <section id="liability" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-accent" /> 6. Limitation of Liability
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    FocusFlow is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. In no event shall FocusFlow, its directors, or employees be liable for any indirect, incidental, or consequential damages resulting from your use of the Service.
                  </p>
                </div>
              </section>

              <section id="termination" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <Gavel className="w-6 h-6 text-accent" /> 7. Termination
                </h2>
                <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                  <p>
                    We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.
                  </p>
                </div>
              </section>

              <section id="governing" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of <strong>[Your Jurisdiction/Country]</strong>, without regard to its conflict of law provisions.
                </p>
              </section>

              <section id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-accent" /> 9. Contact Information
                </h2>
                <div className="p-8 bg-[var(--text-primary)] text-[var(--bg)] rounded-2xl shadow-xl">
                  <h3 className="text-xl font-bold mb-4">Have questions?</h3>
                  <p className="opacity-80 mb-6">If you have any questions about these Terms, please contact us at:</p>
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 font-medium underline underline-offset-4">
                      support@focusflow.app
                    </p>
                    <p className="text-sm opacity-70">FocusFlow Legal Department</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-12 bg-[var(--card)]/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} FocusFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
