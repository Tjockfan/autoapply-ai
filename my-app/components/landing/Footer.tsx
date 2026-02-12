import Link from 'next/link';
import { Anchor } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'API'],
  },
  company: {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  legal: {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies'],
  },
};

export function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-ocean-500 rounded-xl flex items-center justify-center">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">AutoApply AI</span>
            </Link>
            <p className="text-gray-400 text-sm">
              AI-powered job application automation for yacht crew professionals. Land your dream job faster.
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-ocean-400 text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 AutoApply AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['X', 'in', '📸'].map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-ocean-500 transition-colors"
              >
                <span className="text-sm">{social}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
