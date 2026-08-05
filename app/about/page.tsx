import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SmileArc } from "@/components/public/SmileArc";

export default function AboutPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
          <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">About us</p>
          <h1 className="font-display font-extrabold text-4xl text-ink mt-2">
            Neighborhood dentistry, done properly.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 md:px-8 py-16 md:py-20">
        <div className="relative rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl bg-sand p-8 md:p-12">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
          <div className="rounded-2xl border border-line p-6">
            <p className="font-display font-bold text-ink">General dentistry</p>
            <p className="text-sm text-ink/60 mt-2">Checkups, cleanings, fillings, and everyday care.</p>
          </div>
          <div className="rounded-2xl border border-line p-6">
            <p className="font-display font-bold text-ink">Restorative care</p>
            <p className="text-sm text-ink/60 mt-2">Crowns, dentures, root canal, and tooth replacement.</p>
          </div>
          <div className="rounded-2xl border border-line p-6">
            <p className="font-display font-bold text-ink">Cosmetic treatment</p>
            <p className="text-sm text-ink/60 mt-2">Whitening and orthodontic treatment for your smile.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
