import Link from "next/link";
import { CLINIC_ADDRESS, CLINIC_PHONE } from "@/lib/whatsapp/deepLink";

export function PublicFooter() {
  return (
    <footer className="bg-ink text-white mt-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-display font-extrabold text-lg">
            Mehran Dental<span className="text-teal">.</span>
          </p>
          <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs">
            A neighborhood dental clinic in Latifabad, Hyderabad — general and cosmetic
            dentistry for the whole family.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white/90 mb-3">Visit us</p>
          <p className="text-white/60 leading-relaxed">{CLINIC_ADDRESS}</p>
          <p className="text-white/60 mt-2">{CLINIC_PHONE}</p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white/90 mb-3">Explore</p>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/portal/login" className="hover:text-white">Staff login</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} Mehran Dental Care, Hyderabad.
        </p>
      </div>
    </footer>
  );
}
