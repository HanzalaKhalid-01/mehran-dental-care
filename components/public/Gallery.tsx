import { galleryPhotos } from "@/lib/gallery";

export function PhotoGrid({ limit }: { limit?: number }) {
  const photos = limit ? galleryPhotos.slice(0, limit) : galleryPhotos;
  const featured = photos.find((p) => "featured" in p && p.featured) ?? photos[0];
  const rest = photos.filter((p) => p !== featured);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div className="col-span-2 row-span-2 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-xl rounded-bl-xl overflow-hidden bg-mint">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={featured.src}
          alt={featured.alt}
          loading="lazy"
          className="w-full h-full object-cover aspect-square md:aspect-auto"
        />
      </div>
      {rest.map((p) => (
        <div key={p.src} className="rounded-2xl overflow-hidden bg-mint">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.src} alt={p.alt} loading="lazy" className="w-full h-full object-cover aspect-square" />
        </div>
      ))}
    </div>
  );
}
