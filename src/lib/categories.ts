export const categories = [
  {
    slug: 'android',
    name: 'Android',
    number: '01',
    description:
      'Panduan, eksperimen, dan penjelasan praktis untuk memahami perangkat Android, privasi, pembaruan, dan kebiasaan digital yang lebih baik.',
  },
  {
    slug: 'engineering-linux',
    name: 'Engineering & Linux',
    number: '02',
    description:
      'Catatan tentang Linux, Termux, otomasi, shell, server, dan cara kerja sistem yang sering tersembunyi di balik antarmuka.',
  },
  {
    slug: 'ai-software',
    name: 'AI & Software',
    number: '03',
    description:
      'Analisis dan panduan tentang AI, rekayasa perangkat lunak, kontrak data, serta cara memakai alat baru secara kritis.',
  },
  {
    slug: 'technology-innovation',
    name: 'Technology & Innovation',
    number: '04',
    description:
      'Perspektif tentang standar, umur pakai perangkat, interoperabilitas, dan inovasi yang berdampak nyata.',
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category['slug'];

export const categorySlugs = categories.map((category) => category.slug) as [
  CategorySlug,
  ...CategorySlug[],
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return categories.some((category) => category.slug === slug);
}
