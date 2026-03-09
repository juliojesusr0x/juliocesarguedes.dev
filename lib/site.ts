export const site = {
  name: "Julio Cesar Guedes",
  tagline: "Senior Frontend | React, TypeScript, Node.js, AWS",
  location: "Florianópolis, Brazil",
  description:
    "Senior Software Engineer specializing in frontend and full stack development, building scalable and high-performance web applications using React, Next.js, TypeScript, Node.js, and AWS. Experienced with high traffic platforms, data heavy dashboards, and large scale migrations, with strong focus on performance, maintainability, and clean architecture. Comfortable working across frontend, backend APIs, databases, and cloud environments, and actively leveraging AI-assisted development tools to improve engineering productivity.",
  email: "juliocg22@gmail.com",
  phone: "+55 31 99155-1734",
  social: {
    linkedin: "https://linkedin.com/in/julioguedes",
    github: "https://github.com/juliojesusr0x",
  },
  skills: {
    frontend: [
      "React.js",
      "Next.js",
      "Vue.js",
      "TypeScript",
      "JavaScript",
      "Redux",
      "Context API",
      "Zustand",
      "Jotai",
      "TanStack Query",
      "React Hook Form",
      "Zod",
      "TailwindCSS",
      "MUI",
      "Shadcn",
    ],
    backend: ["Node.js", "PHP", "Laravel", "REST APIs", "Authentication"],
    databases: ["PostgreSQL", "MySQL", "Redis"],
    cloud: ["AWS Lambda", "Docker", "CI/CD", "Jenkins", "Microservices"],
    testing: ["Vitest", "React Testing Library", "Cypress", "Playwright"],
    tools: ["Git", "GitHub", "GitLab", "Bitbucket", "Jira"],
  },
  projects: [] as Array<{ title: string; description: string; url?: string }>,
};

export type Project = (typeof site.projects)[number];
export type SkillCategory = keyof typeof site.skills;
