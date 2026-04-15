export type BuildingProject = {
  title: string;
  description: string;
  tech: readonly string[];
  githubUrl?: string;
  comingSoon?: boolean;
};

export type LiveProject = {
  title: string;
  description: string;
  tech: readonly string[];
  url: string;
};

export const site = {
  name: "Julio Cesar Guedes",
  titleLine: "Senior Frontend Engineer | React + TypeScript + Next.js",
  subtitleLine: "Performance & architecture · 17+ years of experience",
  location: "Florianópolis, Brazil",
  about:
    "Senior Software Engineer with 17+ years of experience building scalable, high-performance web applications at enterprise scale. I specialize in React, TypeScript, and Next.js, with a focus on performance optimization and large-scale frontend architecture. I have led migrations of 500+ client websites to modern stacks, improving load times, SEO, and user experience on complex platforms. Strong in reusable design systems, SSR and SEO best practices, and collaborating across frontend and backend.",
  skillsHighlight: [
    "React.js",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Vue.js",
    "Node.js",
    "AWS",
    "PostgreSQL",
    "Docker",
    "CI/CD",
  ],
  email: "juliocg22@gmail.com",
  social: {
    linkedin: "https://www.linkedin.com/in/julioguedes",
    github: "https://github.com/juliojesusr0x",
    calendly: "https://calendly.com/juliocg22",
  },
  liveProjects: [
    {
      title: "Blueticket",
      description:
        "High-traffic ticketing platform where performance, SEO, and reliability directly impact sales. Led development of a server-side rendered application and integrated AWS Lambda for scalable, event-driven backend operations.",
      tech: ["Vue.js", "Nuxt.js", "Laravel", "PostgreSQL", "AWS Lambda"],
      url: "https://www.blueticket.com.br",
    },
    {
      title: "Potássio do Brasil",
      description:
        "Corporate website built from the ground up, focused on a clear presentation of the brand and reliable delivery.",
      tech: ["PHP", "CodeIgniter", "MySQL", "JavaScript", "CSS"],
      url: "https://www.potassiodobrasil.com.br",
    },
  ] satisfies readonly LiveProject[],
  buildingProjects: [
    {
      title: "Audiofy",
      description:
        "Mobile app that converts video files to audio and plays them in the background—saved clips, WhatsApp videos, Loom recordings, and lectures—while you use your phone for other tasks.",
      tech: [
        "React Native",
        "Expo",
        "TypeScript",
        "FFmpeg",
        "react-native-track-player",
      ],
      githubUrl: "https://github.com/juliojesusr0x/audiofy",
    },
    {
      title: "Terço App",
      description:
        "Catholic prayer app: browse prayers, build custom prayer queues, and generate shareable prayer pages from your list.",
      tech: ["React", "Node.js", "NestJS"],
      githubUrl: "https://github.com/juliojesusr0x/terco-app",
    },
    {
      title: "Rezalve",
      description:
        "Transforms your resume into API-ready variables, with a browser extension that auto-fills recruiter forms on job sites.",
      tech: ["Next.js"],
      comingSoon: true,
    },
  ] satisfies readonly BuildingProject[],
} as const;
