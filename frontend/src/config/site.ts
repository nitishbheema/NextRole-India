export const siteConfig = {
  name: 'NextRole India',
  tagline: 'Your next opportunity starts here.',
  description:
    'Automated job aggregation platform for Indian tech professionals, freshers, and students. Discover verified openings directly from company career pages.',
  author: {
    name: 'Bheema Nitish Guru Datha',
    github: 'https://github.com/nitishbheema/',
    linkedin: 'https://www.linkedin.com/in/nitishbheema/',
  },
  repository: 'https://github.com/nitishbheema/NextRole-India.git',
  aggregators: {
    naukri: {
      name: 'Naukri.com',
      baseUrl: 'https://www.naukri.com/',
      searchUrl: (keyword?: string, location?: string) => {
        const terms = [keyword, location].filter(Boolean).join(' ');
        return terms
          ? `https://www.naukri.com/${encodeURIComponent(terms.replace(/\s+/g, '-'))}-jobs`
          : 'https://www.naukri.com/';
      },
      description:
        'Broad Indian enterprise and IT recruitment aggregator. Link-only integration; search official listings safely on Naukri.',
    },
    unstop: {
      name: 'Unstop',
      baseUrl: 'https://unstop.com/',
      searchUrl: (keyword?: string) => {
        return keyword
          ? `https://unstop.com/jobs?searchTerm=${encodeURIComponent(keyword)}`
          : 'https://unstop.com/jobs';
      },
      description:
        'Early-career hiring, fresher challenges, student internships, and hackathons.',
    },
  },
};
