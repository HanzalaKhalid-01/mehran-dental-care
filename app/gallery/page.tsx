import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PhotoGrid } from "@/components/public/Gallery";

export default function GalleryPage() {
  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">Gallery</p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-ink mt-2 tracking-tight">
            A look inside
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
        <PhotoGrid />
      </section>

      <PublicFooter />
    </>
  );
}
