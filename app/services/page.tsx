import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { services } from "@/lib/services";
import { CLINIC_PHONE, whatsappLink } from "@/lib/whatsapp/deepLink";

const bookingLink = whatsappLink(CLINIC_PHONE, "newBookingRequest");

export default function ServicesPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">What we treat</p>
          <h1 className="font-display font-extrabold text-4xl text-ink mt-2">Services</h1>
          <p className="text-ink/70 mt-3 max-w-lg">
            General and cosmetic dentistry for every stage of life. Not sure what you
            need? Message us and we&apos;ll point you in the right direction.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {services.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl border border-line p-7 hover:border-teal/40 transition-colors"
            >
              <p className="font-display font-bold text-lg text-ink">{s.name}</p>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">{s.description}</p>
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm font-semibold text-teal hover:text-teal-dark"
              >
                Ask about this on WhatsApp →
              </a>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
