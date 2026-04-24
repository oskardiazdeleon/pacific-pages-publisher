import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-semibold">
            sandiego<span className="text-teal-soft">.com</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/70">
            The definitive guide to America's Finest City — places to stay, eat, explore and the
            stories behind them.
          </p>
        </div>
        <div>
          <div className="eyebrow text-teal-soft">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/listings" className="hover:text-teal-soft">Listings</Link></li>
            <li><Link to="/articles" className="hover:text-teal-soft">Articles</Link></li>
            <li><Link to="/neighborhoods" className="hover:text-teal-soft">Neighborhoods</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-teal-soft">Business</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/partners" className="hover:text-teal-soft">Advertise with us</Link></li>
            <li><Link to="/partners" className="hover:text-teal-soft">List your business</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page py-5 text-xs text-primary-foreground/60 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} sandiego.com — All rights reserved.</span>
          <span>Made on the Pacific coast.</span>
        </div>
      </div>
    </footer>
  );
}
