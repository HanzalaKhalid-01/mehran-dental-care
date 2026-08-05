/**
 * Phase 1 WhatsApp automation: zero-setup click-to-chat deep links.
 * Generates a wa.me URL pre-filled with a message; tapping it opens
 * WhatsApp (Business app) with the message ready to send.
 */

const CLINIC_NAME = "Mehran Dental Care";
export const CLINIC_PHONE = "0335 2411106";
export const CLINIC_ADDRESS =
  "Unit No. 10, Market Road, near Afzal Ground, Latifabad Unit 10, Hyderabad, 71000";

function toWhatsAppNumber(phone: string) {
  // Strip spaces/dashes; assume Pakistani numbers, convert leading 0 to 92.
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  if (digits.startsWith("92")) return digits;
  return digits;
}

function buildLink(phone: string, message: string) {
  const number = toWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const whatsappTemplates = {
  appointmentConfirmation: (patientName: string, dateTime: string) =>
    `Hi ${patientName}, your appointment at ${CLINIC_NAME} is confirmed for ${dateTime}. See you then!`,

  appointmentReminder: (patientName: string, dateTime: string) =>
    `Hi ${patientName}, this is a reminder for your appointment at ${CLINIC_NAME} on ${dateTime}. Reply if you need to reschedule.`,

  paymentReminder: (patientName: string, amount: string) =>
    `Hi ${patientName}, this is a friendly reminder that a balance of Rs. ${amount} is outstanding at ${CLINIC_NAME}. Please let us know if you have any questions.`,

  reviewRequest: (patientName: string) =>
    `Hi ${patientName}, thank you for visiting ${CLINIC_NAME}! We'd really appreciate it if you could leave us a quick Google review: https://g.page/r/mehran-dental-review`,

  followUpReminder: (patientName: string, dateTime: string) =>
    `Hi ${patientName}, it's time for your follow-up visit at ${CLINIC_NAME}. Could you come in around ${dateTime}? Let us know what works for you.`,

  missedAppointment: (patientName: string) =>
    `Hi ${patientName}, we missed you at your appointment today at ${CLINIC_NAME}. Would you like to reschedule?`,

  newBookingRequest: () =>
    `Hi ${CLINIC_NAME}, I'd like to book an appointment. My name is: ___. Preferred day/time: ___.`,

  generalInquiry: () => `Hi ${CLINIC_NAME}, I have a question about your services.`,
};

export function whatsappLink(
  phone: string,
  template: keyof typeof whatsappTemplates,
  ...args: string[]
) {
  // @ts-expect-error - template args vary per template, this is a thin convenience wrapper
  const message = whatsappTemplates[template](...args);
  return buildLink(phone, message);
}
