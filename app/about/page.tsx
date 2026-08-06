import { Stethoscope, HeartPulse, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SmileArc } from "@/components/public/SmileArc";
import { Reveal, Stagger, StaggerItem } from "@/components/public/motion";

const pillars = [
  {
    icon: Stethoscope,
    title: "General dentistry",
    body: "Checkups, cleanings, fillings, and everyday care.",
  },
  {
    icon: HeartPulse,
    title: "Restorative care",
    body: "Crowns, dentures, root canal, and tooth replacement.",
  },
  {
    icon: Sparkles,
    title: "Cosmetic treatment",
    body: "Whitening and orthodontic treatment for your smile.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">About us</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-ink mt-2 tracking-tight">
              Neighborhood dentistry,
              <br className="hidden sm:block" /> done properly.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 md:px-8 py-16 md:py-20">
        <Reveal className="relative rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl bg-sand p-8 md:p-12">
          <SmileArc className="absolute -top-8 left-10 w-40 h-14 text-teal/30" />
          <p className="text-ink/80 leading-relaxed">
            Mehran Dental Care is a local clinic in Latifabad, Hyderabad, offering
            general and cosmetic dental treatment — from routine cleanings and
            fillings to root canal treatment, dentures, and orthodontics — for
            patients of all ages.
          </p>
          <p className="text-ink/80 leading-relaxed mt-4">
            We keep two daily shifts so that patients with work or school schedules
            can still find a convenient time, and we handle appointment requests and
            questions directly over WhatsApp so getting in touch is simple.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <div className="h-full rounded-2xl border border-line p-6">
                <div className="w-9 h-9 rounded-full bg-mint text-teal-dark flex items-center justify-center">
                  <p.icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <p className="font-display font-bold text-ink mt-4">{p.title}</p>
                <p className="text-sm text-ink/60 mt-2">{p.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <PublicFooter />
    </>
  );
}
