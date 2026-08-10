// Paraphrased from real patient reviews on the clinic's Google Business Profile.
// Kept in patients' own sentiment but rewritten, not quoted verbatim.
// Includes a mixed review too — real reviews aren't all five stars, and that's fine.
export const googleRating = 4.0;
export const googleReviewCount = 7;
export const googleReviewsUrl =
  "https://www.google.com/maps/place/?q=place_id:ChIJAyZ5IQtxTDkRt3qcanntRNU";

export const reviewHighlights = [
  {
    text: "A patient described real relief after treatment from Dr. Usama, thanking him warmly for the results.",
  },
  {
    text: "One patient who'd had root canal treatment about a year and a half earlier called both doctors very cooperative, giving a slight edge to Mr. Shakir.",
  },
  {
    text: "Another patient said they left pain-free and very satisfied with their visit.",
  },
  {
    text: "A reviewer praised both doctors for treating patients with kindness, calling the clinic highly recommended.",
  },
  {
    text: "Not every visit was perfect — one reviewer felt treatment quality was good but didn't always hold up long-term.",
  },
] as const;
