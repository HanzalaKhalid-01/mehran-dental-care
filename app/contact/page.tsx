import { MapPin, MessageCircle, Clock } from "lucide-react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Reveal, Stagger, StaggerItem } from "@/components/public/motion";
import { CLINIC_ADDRESS, CLINIC_PHONE, whatsappLink } from "@/lib/whatsapp/deepLink";
import { weeklyHours } from "@/lib/hours";

const bookingLink = whatsappLink(CLINIC_PHONE, "newBookingRequest");
const inquiryLink = whatsappLink(CLINIC_PHONE, "generalInquiry");
const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(CLINIC_ADDRESS)}&output=embed`;

export default function ContactPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">Get in touch</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-ink mt-2 tracking-tight">
              Visit or message us
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10">
        <Stagger className="space-y-6">
          <StaggerItem>
            <div className="rounded-2xl border border-line p-7">
              <div className="w-9 h-9 rounded-full bg-mint text-teal-dark flex items-center justify-center">
                <MapPin className="w-4 h-4" strokeWidth={2} />
              </div>
              <p className="font-display font-bold text-ink mt-4">Address</p>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">{CLINIC_ADDRESS}</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-2xl border border-line p-7">
              <div className="w-9 h-9 rounded-full bg-mint text-teal-dark flex items-center justify-center">
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
              </div>
              <p className="font-display font-bold text-ink mt-4">Phone / WhatsApp</p>
              <p className="text-sm text-ink/60 mt-2">{CLINIC_PHONE}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href={bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-teal text-white font-semibold px-5 py-2.5 text-sm hover:bg-teal-dark transition-colors"
                >
                  Book on WhatsApp
                </a>
                <a
                  href={inquiryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink/15 text-ink font-semibold px-5 py-2.5 text-sm hover:bg-mint transition-colors"
                >
                  Ask a question
                </a>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-2xl border border-line p-7">
              <div className="w-9 h-9 rounded-full bg-mint text-teal-dark flex items-center justify-center">
                <Clock className="w-4 h-4" strokeWidth={2} />
              </div>
              <p className="font-display font-bold text-ink mt-4">Hours</p>
              <div className="mt-3 divide-y divide-line">
                {weeklyHours.map((d) => (
                  <div key={d.day} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink/60">{d.day}</span>
                    <span className="font-medium text-ink text-right">{d.shifts.join(" · ")}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink/50 mt-3">
                Timings can occasionally shift — message us on WhatsApp to confirm before you head over.
              </p>
            </div>
          </StaggerItem>
        </Stagger>

        <Reveal delay={0.1} className="rounded-2xl overflow-hidden border border-line h-80 md:h-full min-h-80">
          <iframe
            title="Mehran Dental Care location"
            src={mapEmbedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </Reveal>
      </section>

      <PublicFooter />
    </>
  );
}
