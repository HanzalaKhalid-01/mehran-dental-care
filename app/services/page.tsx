import {
  Sparkles,
  Sun,
  Activity,
  ShieldCheck,
  Layers,
  Smile as SmileIcon,
  Repeat,
  Scissors,
} from "lucide-react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Reveal, Stagger, StaggerItem, HoverLift } from "@/components/public/motion";
import { services } from "@/lib/services";
import { CLINIC_PHONE, whatsappLink } from "@/lib/whatsapp/deepLink";

const bookingLink = whatsappLink(CLINIC_PHONE, "newBookingRequest");

const serviceIcons = [Sparkles, Sun, Activity, ShieldCheck, Layers, SmileIcon, Repeat, Scissors];

export default function ServicesPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">What we treat</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-ink mt-2 tracking-tight">
              Services
            </h1>
            <p className="text-ink/70 mt-3 max-w-lg">
              General and cosmetic dentistry for every stage of life. Not sure what you
              need? Message us and we&apos;ll point you in the right direction.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {services.map((s, i) => {
            const Icon = serviceIcons[i];
            return (
              <StaggerItem key={s.name}>
                <HoverLift className="h-full">
                  <div className="h-full rounded-2xl border border-border p-7 hover:border-teal/40 hover:shadow-lg hover:shadow-ink/5 transition-[border-color,box-shadow]">
                    <div className="w-10 h-10 rounded-full bg-mint text-teal-dark flex items-center justify-center">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="font-display font-bold text-lg text-ink mt-4">{s.name}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
                    <a
                      href={bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-sm font-semibold text-teal hover:text-teal-dark"
                    >
                      Ask about this on WhatsApp →
                    </a>
                  </div>
                </HoverLift>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <PublicFooter />
    </>
  );
}
