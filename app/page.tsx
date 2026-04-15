import { site } from "@/lib/site";
import { SocialIcons } from "@/app/components/SocialIcons";
import type { BuildingProject, LiveProject } from "@/lib/site";

function TechPills({ tech }: { tech: readonly string[] }) {
  return (
    <ul className="mt-2.5 flex flex-wrap gap-1.5">
      {tech.map((t) => (
        <li key={t}>
          <span className="inline-block rounded border border-stone-200 bg-white px-2 py-0.5 font-mono text-[10px] text-stone-800 sm:text-xs">
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

function LiveProjectCard({ project }: { project: LiveProject }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-(--card)/90 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-stone-900 sm:text-lg">
          {project.title}
        </h3>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[10px] text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-900 hover:decoration-stone-600 sm:text-xs"
        >
          Visit site →
        </a>
      </div>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-stone-600">
        {project.description}
      </p>
      <TechPills tech={project.tech} />
    </article>
  );
}

function BuildingProjectCard({ project }: { project: BuildingProject }) {
  return (
    <article className="rounded-lg border border-dashed border-stone-300 bg-(--card)/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-stone-900 sm:text-lg">
            {project.title}
          </h3>
          <span className="rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide text-stone-600 sm:text-[10px]">
            Building
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 font-mono text-[10px] sm:text-xs">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-900 hover:decoration-stone-600"
            >
              GitHub →
            </a>
          )}
          {project.comingSoon && (
            <span className="text-stone-500">Coming soon</span>
          )}
        </div>
      </div>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-stone-600">
        {project.description}
      </p>
      <TechPills tech={project.tech} />
    </article>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 sm:px-6 sm:py-14">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {site.name}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-pretty font-mono text-xs leading-snug text-stone-700 sm:text-sm">
            {site.titleLine}
          </p>
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            {site.subtitleLine}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">{site.location}</p>
        </header>

        <div className="mt-5 flex justify-center sm:mt-6">
          <SocialIcons />
        </div>

        <section
          className="mt-8 sm:mt-10"
          aria-labelledby="about-heading"
        >
          <h2
            id="about-heading"
            className="text-center font-mono text-[10px] font-medium uppercase tracking-widest text-stone-500"
          >
            About
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-center text-sm leading-relaxed text-stone-700 sm:text-base">
            {site.about}
          </p>
        </section>

        <section
          className="mt-8 sm:mt-10"
          aria-labelledby="skills-heading"
        >
          <h2
            id="skills-heading"
            className="text-center font-mono text-[10px] font-medium uppercase tracking-widest text-stone-500"
          >
            Core technologies
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-stone-600 sm:text-base">
            {site.skillsHighlight.join(" · ")}
          </p>
        </section>

        <section
          className="mt-10 sm:mt-12"
          aria-labelledby="live-projects-heading"
        >
          <h2
            id="live-projects-heading"
            className="font-mono text-[10px] font-medium uppercase tracking-widest text-stone-500"
          >
            Live projects
          </h2>
          <div className="mt-4 grid gap-4 sm:gap-5">
            {site.liveProjects.map((project) => (
              <LiveProjectCard key={project.title} project={project} />
            ))}
          </div>
        </section>

        <section
          className="mt-10 sm:mt-12"
          aria-labelledby="building-projects-heading"
        >
          <h2
            id="building-projects-heading"
            className="font-mono text-[10px] font-medium uppercase tracking-widest text-stone-500"
          >
            Building
          </h2>
          <div className="mt-4 grid gap-4 sm:gap-5">
            {site.buildingProjects.map((project) => (
              <BuildingProjectCard key={project.title} project={project} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
