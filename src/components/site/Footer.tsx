import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import sandiegoLogo from "@/assets/sandiego-logo.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={sandiegoLogo}
              alt="sandiego.com"
              className="h-10 w-10 invert brightness-0 contrast-200"
            />
            <div className="font-display text-2xl font-semibold">
              sandiego<span className="text-teal-soft">.com</span>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
            The definitive guide to America's Finest City — places to stay, eat, explore and the
            stories behind them.
          </p>
          <div className="mt-6 space-y-1 text-sm text-primary-foreground/70">
            <div>P.O. Box 701, Rancho Santa Fe, CA 92067</div>
            <div>
              <a href="tel:+16193878920" className="hover:text-teal-soft">
                (619) 387-8920
              </a>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.facebook.com/MySanDiego/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 hover:border-teal-soft hover:text-teal-soft transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/sandiegodotcom/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 hover:border-teal-soft hover:text-teal-soft transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/mysandiego"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 hover:border-teal-soft hover:text-teal-soft transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="eyebrow text-teal-soft">What's New</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/listings" className="hover:text-teal-soft">Upcoming Events</Link></li>
            <li><Link to="/articles" className="hover:text-teal-soft">Get the Inside Scoop</Link></li>
            <li><Link to="/articles" className="hover:text-teal-soft">E-Newsletter</Link></li>
            <li><Link to="/neighborhoods" className="hover:text-teal-soft">Neighborhoods</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-teal-soft">Company</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-teal-soft">About Us</Link></li>
            <li><Link to="/partners" className="hover:text-teal-soft">Contact</Link></li>
            <li><Link to="/partners" className="hover:text-teal-soft">Advertise</Link></li>
            <li><Link to="/" className="hover:text-teal-soft">Sitemap</Link></li>
            <li><Link to="/" className="hover:text-teal-soft">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:text-teal-soft">Your Privacy Choices</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page py-5 text-xs text-primary-foreground/60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Welk Digital Innovations. All rights reserved.</span>
          <span>Made on the Pacific coast.</span>
        </div>
      </div>
    </footer>
  );
}
