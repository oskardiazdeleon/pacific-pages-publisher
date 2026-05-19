import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import sandiegoLogo from "@/assets/sandiego-logo.png";
import { fetchPublishedMenu, fetchPublishedSettings, type NavItem, type SiteSettingsMap } from "@/lib/cms";
import { insiderUTM, partnerUTM } from "@/lib/utm";

export function Footer() {
  const [settings, setSettings] = useState<SiteSettingsMap>({});
  const [whatsNew, setWhatsNew] = useState<NavItem[]>([]);
  const [company, setCompany] = useState<NavItem[]>([]);

  useEffect(() => {
    (async () => {
      const [s, wn, co] = await Promise.all([
        fetchPublishedSettings(),
        fetchPublishedMenu("footer_whats_new"),
        fetchPublishedMenu("footer_company"),
      ]);
      setSettings(s); setWhatsNew(wn); setCompany(co);
    })();
  }, []);

  const siteName = settings.brand?.site_name || "sandiego.com";
  const logoUrl = settings.brand?.logo_url || sandiegoLogo;
  const tagline = settings.brand?.footer_tagline || "The definitive guide to America's Finest City — places to stay, eat, explore and the stories behind them.";
  const address = settings.contact?.address;
  const phone = settings.contact?.phone;
  const phoneHref = settings.contact?.phone_href;
  const social = settings.social || {};
  const legal = settings.footer_legal || {};

  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt={siteName} className="h-12 w-auto" />
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">{tagline}</p>
          <div className="mt-6 space-y-1 text-sm text-primary-foreground/70">
            {address && <div>{address}</div>}
            {phone && (
              <div>
                <a href={phoneHref || `tel:${phone}`} className="hover:text-teal-soft">{phone}</a>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 hover:border-teal-soft hover:text-teal-soft transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 hover:border-teal-soft hover:text-teal-soft transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 hover:border-teal-soft hover:text-teal-soft transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <div className="eyebrow text-teal-soft">What's New</div>
          <ul className="mt-4 space-y-2 text-sm">
            {(whatsNew.length ? whatsNew : [
              { label: "New This Week", to: "/articles" },
              { label: "Latest Articles", to: "/articles" },
              { label: "Member Deals", to: "/insider" },
              { label: "Insider Newsletter", to: "/insider" },
            ]).map((it) => (
              <li key={it.label}>
                <Link
                  to={it.to}
                  search={
                    it.to === "/insider"
                      ? insiderUTM("footer")
                      : it.to === "/partners" || it.to === "/partner"
                        ? partnerUTM("footer")
                        : undefined
                  }
                  className="hover:text-teal-soft"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow text-teal-soft">Company</div>
          <ul className="mt-4 space-y-2 text-sm">
            {(company.length ? company : [
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
              { label: "Partner With Us", to: "/partners" },
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Service", to: "/terms" },
            ]).map((it) => (
              <li key={it.label}>
                <Link
                  to={it.to}
                  search={
                    it.to === "/insider"
                      ? insiderUTM("footer")
                      : it.to === "/partners" || it.to === "/partner"
                        ? partnerUTM("footer")
                        : undefined
                  }
                  className="hover:text-teal-soft"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page py-5 text-xs text-primary-foreground/60 flex flex-wrap justify-between gap-2">
          <span>{legal.copyright ? `© ${new Date().getFullYear()} ${legal.copyright.replace(/^©\s*/, "")}` : `© ${new Date().getFullYear()} ${siteName}`}</span>
          <span>{legal.right_text || ""}</span>
        </div>
      </div>
    </footer>
  );
}
