import { site } from "@/lib/site";
import { SocialIcons } from "@/app/components/SocialIcons";
import type { SkillCategory } from "@/lib/site";

const skillLabels: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  cloud: "Cloud & DevOps",
  testing: "Testing",
  tools: "Tools",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
        {/* Hero */}
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {site.name}
          </h1>
          <p className="mt-2 font-mono text-sm tracking-wide text-stone-600 sm:text-base">
            {site.tagline}
          </p>
          {site.location && (
            <p className="mt-1 text-sm text-stone-500">{site.location}</p>
          )}
          <p className="mt-6 text-pretty text-base leading-relaxed text-stone-700 sm:text-lg">
            {site.description}
          </p>
        </header>

        {/* Contact */}
        <div className="mt-12 flex justify-center">
          <SocialIcons />
        </div>

        {/* Technical skills by category */}
        <section
          className="mt-20 sm:mt-24"
          aria-labelledby="skills-heading"
        >
          <h2
            id="skills-heading"
            className="text-center font-mono text-xs font-medium uppercase tracking-widest text-stone-500"
          >
            Technical skills
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {(Object.keys(site.skills) as SkillCategory[]).map((category) => (
              <div
                key={category}
                className="rounded-lg border border-stone-200 bg-[var(--card)]/80 px-5 py-4 backdrop-blur-sm"
              >
                <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-stone-600">
                  {skillLabels[category]}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {site.skills[category].map((tech) => (
                    <li key={tech}>
                      <span className="rounded-md border border-stone-200 bg-white px-2.5 py-1 font-mono text-xs text-stone-800 shadow-sm">
                        {tech}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {site.projects.length > 0 && (
          <>
            <hr className="my-16 border-stone-200" />
            <section
              className="text-left"
              aria-labelledby="projects-heading"
            >
              <h2
                id="projects-heading"
                className="font-mono text-xs font-medium uppercase tracking-widest text-stone-500"
              >
                Current projects
              </h2>
              <ul className="mt-6 space-y-5">
                {site.projects.map((project) => (
                  <li
                    key={project.title}
                    className="rounded-lg border border-stone-200 bg-[var(--card)]/60 px-5 py-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold text-stone-900">
                        {project.title}
                      </span>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-900 hover:decoration-stone-600"
                        >
                          View →
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
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
