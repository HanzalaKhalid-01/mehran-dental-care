import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CLINIC_ADDRESS, CLINIC_PHONE, whatsappLink } from "@/lib/whatsapp/deepLink";

const bookingLink = whatsappLink(CLINIC_PHONE, "newBookingRequest");
const inquiryLink = whatsappLink(CLINIC_PHONE, "generalInquiry");
const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(CLINIC_ADDRESS)}&output=embed`;

export default function ContactPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">Get in touch</p>
          <h1 className="font-display font-extrabold text-4xl text-ink mt-2">Visit or message us</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="rounded-2xl border border-line p-7">
            <p className="font-display font-bold text-ink">Address</p>
            <p className="text-sm text-ink/60 mt-2 leading-relaxed">{CLINIC_ADDRESS}</p>
          </div>

          <div className="rounded-2xl border border-line p-7">
            <p className="font-display font-bold text-ink">Phone / WhatsApp</p>
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

          <div className="rounded-2xl border border-line p-7">
            <p className="font-display font-bold text-ink">Hours</p>
            <p className="text-sm text-ink/60 mt-2 leading-relaxed">
              Open in two daily shifts (morning, closing 4:00 PM, and evening from
              7:15 PM). Exact timing can vary — message us on WhatsApp to confirm
              before you head over.
            </p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-line h-80 md:h-full min-h-80">
          <iframe
            title="Mehran Dental Care location"
            src={mapEmbedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
