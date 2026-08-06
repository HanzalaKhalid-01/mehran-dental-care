import Link from "next/link";
import {
  Sparkles,
  Sun,
  Activity,
  ShieldCheck,
  Layers,
  Smile as SmileIcon,
  Repeat,
  Scissors,
  Clock,
  MessageCircle,
  CalendarCheck,
  MapPin,
} from "lucide-react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SmileArc, SmileDivider } from "@/components/public/SmileArc";
import { Reveal, Stagger, StaggerItem, HoverLift } from "@/components/public/motion";
import { services } from "@/lib/services";
import { CLINIC_PHONE, whatsappLink } from "@/lib/whatsapp/deepLink";

const bookingLink = whatsappLink(CLINIC_PHONE, "newBookingRequest");

const serviceIcons = [Sparkles, Sun, Activity, ShieldCheck, Layers, SmileIcon, Repeat, Scissors];

const steps = [
  {
    icon: MessageCircle,
    title: "Message us on WhatsApp",
    body: "Tell us what you need and your preferred day or time — no phone tag, no forms.",
  },
  {
    icon: CalendarCheck,
    title: "We confirm your slot",
    body: "We reply with a confirmed time that works around our morning and evening shifts.",
  },
  {
    icon: MapPin,
    title: "Visit the clinic",
    body: "Find us on Market Road, Latifabad Unit 10 — walk-ins welcome if we have space.",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-mint">
        <div className="mx-auto max-w-6xl px-5 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <Stagger>
            <StaggerItem>
              <p className="inline-block text-xs font-semibold tracking-wide uppercase text-teal-dark bg-white/70 rounded-full px-3 py-1">
                Latifabad, Hyderabad
              </p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[0.98] tracking-tight text-ink mt-5">
                Dental care
                <br />
                that feels <span className="italic font-medium text-teal-dark">like</span>
                <br />
                next door.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-ink/70 text-base md:text-lg mt-6 max-w-md leading-relaxed">
                General and cosmetic dentistry for the whole family — scaling, whitening,
                root treatment, dentures, and more, from a clinic that knows the
                neighborhood.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <a
                  href={bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-teal text-white font-semibold px-6 py-3 text-sm hover:bg-teal-dark transition-colors"
                >
                  Book on WhatsApp
                </a>
                <a
                  href="tel:03352411106"
                  className="rounded-full border border-ink/15 text-ink font-semibold px-6 py-3 text-sm hover:bg-white transition-colors"
                >
                  Call {CLINIC_PHONE}
                </a>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex items-center gap-2 mt-8 text-sm text-ink/60">
                <span className="text-marigold font-semibold">★ 4.0</span>
                <span>· based on patient reviews on Google</span>
              </div>
            </StaggerItem>
          </Stagger>

          <Reveal delay={0.15} className="relative">
            <div className="relative rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl bg-white shadow-xl shadow-ink/5 p-8 md:p-10">
              <SmileArc className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-20 text-teal/30" />
              <p className="font-display font-bold text-ink text-lg">Today&apos;s hours</p>
              <p className="text-ink/60 text-sm mt-1">Open in two shifts — message us to confirm timing</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-ink/60">Morning shift</span>
                  <span className="font-semibold text-ink">— 4:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink/60">Evening shift</span>
                  <span className="font-semibold text-ink">7:15 PM —</span>
                </div>
              </div>
              <Link
                href="/contact"
                className="mt-6 inline-block text-sm font-semibold text-teal hover:text-teal-dark"
              >
                Full hours &amp; directions →
              </Link>
            </div>
          </Reveal>
        </div>

        <SmileDivider className="text-white relative -mb-px" />
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
        <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">What we treat</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-ink mt-2">Services</h2>
          </div>
          <Link href="/services" className="text-sm font-semibold text-teal hover:text-teal-dark">
            View all services →
          </Link>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.slice(0, 8).map((s, i) => {
            const Icon = serviceIcons[i];
            return (
              <StaggerItem key={s.name}>
                <HoverLift className="h-full">
                  <div className="h-full rounded-2xl border border-line p-6 hover:border-teal/40 hover:shadow-lg hover:shadow-ink/5 transition-[border-color,box-shadow]">
                    <div className="w-10 h-10 rounded-full bg-mint text-teal-dark flex items-center justify-center">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="font-display font-bold text-ink mt-4">{s.name}</p>
                    <p className="text-sm text-ink/60 mt-2 leading-relaxed">{s.description}</p>
                  </div>
                </HoverLift>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* How booking works */}
      <section className="bg-sand py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="max-w-lg mb-14">
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">Getting an appointment</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-ink mt-2 leading-tight">
              Three steps, mostly on WhatsApp.
            </h2>
          </Reveal>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <StaggerItem key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-2xl text-teal/30">
                    0{i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center text-teal-dark shrink-0">
                    <step.icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                </div>
                <p className="font-display font-bold text-ink mt-4">{step.title}</p>
                <p className="text-sm text-ink/60 mt-2 leading-relaxed">{step.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">Why patients choose us</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-ink mt-2 leading-tight">
              A clinic built around your neighborhood, not a waiting room.
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="rounded-2xl bg-mint p-6">
            <div className="w-9 h-9 rounded-full bg-white text-teal-dark flex items-center justify-center">
              <Clock className="w-4 h-4" strokeWidth={2} />
            </div>
            <p className="font-display font-bold text-ink mt-4">Two shifts, daily</p>
            <p className="text-sm text-ink/60 mt-2 leading-relaxed">
              Morning and evening hours mean you can find a time that fits your day.
            </p>
          </Reveal>
          <Reveal delay={0.16} className="rounded-2xl bg-mint p-6">
            <div className="w-9 h-9 rounded-full bg-white text-teal-dark flex items-center justify-center">
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
            </div>
            <p className="font-display font-bold text-ink mt-4">Message before you visit</p>
            <p className="text-sm text-ink/60 mt-2 leading-relaxed">
              Reach us on WhatsApp for questions, appointment requests, or directions.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 pb-20 md:pb-28">
        <Reveal className="relative overflow-hidden rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl bg-ink text-white px-8 py-14 md:px-16 md:py-20 text-center">
          <SmileArc className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-72 h-24 text-teal/30" />
          <h2 className="font-display font-extrabold text-3xl md:text-5xl">Ready for your next visit?</h2>
          <p className="text-white/60 mt-3 max-w-md mx-auto">
            Send us a message on WhatsApp and we&apos;ll get you booked in.
          </p>
          <a
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-7 rounded-full bg-teal text-white font-semibold px-7 py-3 text-sm hover:bg-teal-dark transition-colors"
          >
            Book on WhatsApp
          </a>
        </Reveal>
      </section>

      <PublicFooter />
    </>
  );
}
