export const site = {
  name: "Júlio César Guedes",
  tagline: "Senior Frontend Engineer — React · TypeScript · AI",
  description:
    "Senior Frontend Engineer focused on building scalable, high-performance web applications with strong emphasis on UX, maintainability, and engineering quality. I work with React, TypeScript, and AI-assisted development to ship clean, accessible, and fast experiences.",
  email: "juliojesusrox@gmail.com", // replace with your contact email
  social: {
    linkedin: "https://www.linkedin.com/in/julioguedes/", // replace with your profile
    github: "https://github.com/juliojesusr0x", // replace with your profile
  },
  techStack: [
    "React",
    "TypeScript",
    "JavaScript (ES6+)",
    "Redux",
    "Context API",
    "CSS/SASS",
    "BEM",
    "Nuxt.js",
    "SSR",
    "Jest",
    "Cypress",
    "Playwright",
    "i18n",
    "accessibility",
    "SEO",
    "CI/CD",
  ],
  projects: [
    {
      title: "Booking Agency (Bookingly) 1",
      description: "Booking Agency is a web application that allows users to book and manage their bookings.",
      url: "https://github.com/juliojesusr0x/booking-agency",
    }
  ] as Array<{ title: string; description: string; url?: string }>,
};

export type Project = (typeof site.projects)[number];
