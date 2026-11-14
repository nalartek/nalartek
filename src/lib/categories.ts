export const categories = [
  {
    slug: 'android',
    name: 'Android',
    number: '01',
    description:
      'Panduan, eksperimen, dan penjelasan praktis untuk memahami perangkat Android, privasi, pembaruan, dan kebiasaan digital yang lebih baik.',
    longDescription: [
      'Android adalah sistem operasi yang paling banyak digunakan di dunia, namun kompleksitasnya sering kali menyembunyikan implikasi privasi dan keamanan. Di kategori ini, NalarTek membedah cara kerja izin aplikasi, bagaimana pembaruan sistem didistribusikan, dan bagaimana Anda dapat mengambil kendali atas data pribadi Anda di perangkat.',
      'Kami tidak sekadar memberikan tips cepat. Kami membahas dasar-dasar teknis dan memberikan panduan langkah demi langkah—mulai dari memverifikasi output AI hingga merawat umur pakai baterai—agar Anda dapat mengambil keputusan digital yang lebih cerdas dan aman.',
    ],
  },
  {
    slug: 'engineering-linux',
    name: 'Engineering & Linux',
    number: '02',
    description:
      'Catatan tentang Linux, Termux, otomasi, shell, server, dan cara kerja sistem yang sering tersembunyi di balik antarmuka.',
    longDescription: [
      'Baris perintah (command line) adalah salah satu alat paling ampuh yang bisa dikuasai seorang pengembang. Kategori ini didedikasikan untuk membedah cara kerja sistem operasi Linux, mulai dari tingkat pengguna hingga ke level server dan infrastruktur.',
      'Dari menulis skrip Bash yang lebih aman, mengelola service menggunakan systemd, membaca log sistem, hingga melakukan otomasi di lingkungan Termux, kami menyajikan panduan praktis yang dirancang agar mudah dipahami namun tetap teknis dan akurat.',
    ],
  },
  {
    slug: 'ai-software',
    name: 'AI & Software',
    number: '03',
    description:
      'Analisis dan panduan tentang AI, rekayasa perangkat lunak, kontrak data, serta cara memakai alat baru secara kritis.',
    longDescription: [
      'Kecerdasan Buatan (AI) telah mengubah cara kita menulis kode, menganalisis data, dan membangun perangkat lunak. Namun, AI juga membawa tantangan baru seperti halusinasi, masalah hak cipta, dan jebakan arsitektural jika tidak digunakan dengan tepat.',
      'Di kategori ini, kami mengeksplorasi rekayasa perangkat lunak modern. Mulai dari penerapan JSON Schema sebagai kontrak data, teknik memverifikasi output AI secara skeptis, hingga praktik terbaik dalam membangun aplikasi yang aman, skalabel, dan mudah dirawat.',
    ],
  },
  {
    slug: 'technology-innovation',
    name: 'Technology & Innovation',
    number: '04',
    description:
      'Perspektif tentang standar, umur pakai perangkat, interoperabilitas, dan inovasi yang berdampak nyata.',
    longDescription: [
      'Teknologi tidak hanya berbicara tentang peluncuran gadget terbaru atau peningkatan spesifikasi di atas kertas. Ada ekosistem yang lebih luas: standar terbuka, interoperabilitas antar perangkat, dan keberlanjutan lingkungan yang menentukan masa depan industri.',
      'Kami menganalisis bagaimana standar terbuka mencegah ketergantungan pada satu vendor (vendor lock-in), bagaimana memilih perangkat yang berumur panjang, dan bagaimana kebijakan inovasi—dari reparasi hingga daur ulang—berdampak pada pengalaman pengguna sehari-hari.',
    ],
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
