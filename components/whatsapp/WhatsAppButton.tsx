"use client";

import { whatsappLink, whatsappTemplates } from "@/lib/whatsapp/deepLink";

type Props = {
  phone: string;
  template: keyof typeof whatsappTemplates;
  args: string[];
  label?: string;
};

export function WhatsAppButton({ phone, template, args, label = "WhatsApp" }: Props) {
  const href = whatsappLink(phone, template, ...args);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#22C55E] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.03c-.25.7-1.24 1.28-2.02 1.44-.54.11-1.24.2-3.6-.77-2.98-1.24-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.46.75-2.17 1.02-2.47.27-.3.58-.37.78-.37h.56c.18 0 .42-.02.65.5.25.6.85 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.39-.45.52-.15.15-.31.32-.13.63.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.48 1.53.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.78.84 2.08 1 .3.15.5.22.57.35.08.13.08.72-.17 1.4z" />
      </svg>
      {label}
    </a>
  );
}
