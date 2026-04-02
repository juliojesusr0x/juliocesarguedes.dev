import { site } from "@/lib/site";
import { SocialIcons } from "@/app/components/SocialIcons";
import type { SkillCategory } from "@/lib/site";
import skillExperience from "@/data/skill-experience.json";

const DEFAULT_YEARS = 2;
const getYears = (skill: string): number =>
  (skillExperience as Record<string, number>)[skill] ?? DEFAULT_YEARS;

const skillLabels: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  cloud: "Cloud & DevOps",
  testing: "Testing",
  ai: "AI",
  tools: "Tools",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero — compact */}
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {site.name}
          </h1>
          <p className="mt-1 font-mono text-xs tracking-wide text-stone-600 sm:text-sm">
            {site.tagline}
          </p>
          {site.location && (
            <p className="mt-0.5 text-xs text-stone-500">{site.location}</p>
          )}
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-snug text-stone-700">
            {site.description}
          </p>
        </header>

        {/* Contact */}
        <div className="mt-4 flex justify-center">
          <SocialIcons />
        </div>

        {/* Technical skills — dense grid, no scroll */}
        <section
          className="mt-6 sm:mt-8"
          aria-labelledby="skills-heading"
        >
          <h2
            id="skills-heading"
            className="text-center font-mono text-[10px] font-medium uppercase tracking-widest text-stone-500"
          >
            Technical skills
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {(Object.keys(site.skills) as SkillCategory[]).map((category) => (
              <div
                key={category}
                className="rounded-md border border-stone-200 bg-[var(--card)]/80 px-3 py-2 sm:px-4 sm:py-2.5"
              >
                <h3 className="font-mono text-[10px] font-medium uppercase tracking-wider text-stone-600 sm:text-xs">
                  {skillLabels[category]}
                </h3>
                <ul className="mt-1.5 flex flex-wrap gap-1 sm:mt-2 sm:gap-1.5">
                  {site.skills[category].map((tech) => {
                    const years = getYears(tech);
                    const label =
                      years === 1 ? "1 year" : `${years} years`;
                    return (
                      <li key={tech} className="relative group">
                        <span
                          className="cursor-default rounded border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-800 transition-colors hover:border-stone-400 hover:bg-stone-50 sm:text-xs"
                          aria-describedby={undefined}
                        >
                          {tech}
                        </span>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 font-mono text-[10px] text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 sm:text-xs"
                        >
                          {label} of experience
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {site.projects.length > 0 && (
          <>
            <hr className="my-4 border-stone-200 sm:my-6" />
            <section
              className="text-left"
              aria-labelledby="projects-heading"
            >
              <h2
                id="projects-heading"
                className="font-mono text-[10px] font-medium uppercase tracking-widest text-stone-500"
              >
                Current projects
              </h2>
              <ul className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
                {site.projects.map((project) => (
                  <li
                    key={project.title}
                    className="rounded-md border border-stone-200 bg-[var(--card)]/60 px-3 py-2 sm:px-4 sm:py-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="text-sm font-semibold text-stone-900">
                        {project.title}
                      </span>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-stone-600 underline decoration-stone-300 underline-offset-1 hover:text-stone-900 hover:decoration-stone-600 sm:text-xs"
                        >
                          View →
                        </a>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-stone-600">
                      {project.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
