import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="hidden md:flex flex-col items-center py-stack-lg px-margin-desktop w-full gap-stack-md bg-surface-container-low border-t border-outline-variant mt-12 pb-16">
      <div className="w-full max-w-container-max grid grid-cols-4 gap-gutter">
        <div className="col-span-1">
          <h2 className="font-headline-sm text-primary mb-4 font-bold">NexWire</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The global standard for authoritative editorial excellence. Delivering precise and transparent journalism to a global audience.
          </p>
        </div>
        <div className="col-span-1 flex flex-col gap-2">
          <h4 className="font-label-caps text-on-surface-variant mb-2">Sections</h4>
          <Link className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" to="/category/Tech">Tech</Link>
          <Link className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" to="/category/Politics">Politics</Link>
          <Link className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" to="/category/Sports">Sports</Link>
          <Link className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" to="/category/Economy">Economy</Link>
        </div>
        <div className="col-span-1 flex flex-col gap-2">
          <h4 className="font-label-caps text-on-surface-variant mb-2">Company</h4>
          <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" href="#">About Us</a>
          <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" href="#">Terms of Service</a>
          <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant hover:text-primary hover:underline transition-colors text-sm" href="#">Contact</a>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-label-caps text-on-surface-variant mb-2">Social</h4>
          <div className="flex gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">public</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">rss_feed</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">share</button>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-outline-variant pt-stack-md mt-stack-md flex justify-between items-center max-w-container-max">
        <span className="font-body-md text-on-surface-variant text-sm">© 2026 NexWire. Authoritative Editorial Excellence.</span>
        <div className="flex gap-4 text-xs font-semibold text-on-surface-variant uppercase">
          <span>EST 1984</span>
          <span>NEW YORK • LONDON • TOKYO</span>
        </div>
      </div>
    </footer>
  );
}
