import { SocialIcons } from "@/app/components/SocialIcons";
import { site } from "@/lib/site";
import type { BuildingProject, LiveProject } from "@/lib/site";

type ProjectRowProps = {
  title: string;
  description: string;
  tech: readonly string[];
  url?: string;
  githubUrl?: string;
  comingSoon?: boolean;
  status?: string;
};

function ProjectRow({
  title,
  description,
  tech,
  url,
  githubUrl,
  comingSoon,
  status,
}: ProjectRowProps) {
  return (
    <li className="border-t border-outline-variant/30 py-6 first:border-t-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-xl font-semibold text-on-surface">
            {title}
          </h3>
          {status ? (
            <span className="font-display text-[11px] uppercase tracking-[0.18em] text-secondary">
              [{status}]
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4 font-display text-[11px] uppercase tracking-[0.15em] text-secondary/80">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              &gt; visit
            </a>
          ) : null}
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              &gt; github
            </a>
          ) : null}
          {comingSoon ? (
            <span className="text-on-surface-variant/70">&gt; coming soon</span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-on-surface-variant">
        {description}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tech.map((t) => (
          <li
            key={t}
            className="border border-outline-variant/40 bg-surface-container px-3 py-1 font-display text-[11px] uppercase tracking-[0.15em] text-primary-fixed shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]"
          >
            {t}
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-on-surface">
      <div
        className="pointer-events-none absolute inset-0 blueprint-grid opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-[15%] hidden w-px bg-secondary/10 md:block"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-4xl px-6 py-16 sm:px-10 sm:py-20 md:px-16">
        <header className="flex flex-col gap-6">
          <div className="relative">
            <span
              className="absolute -left-4 top-3 hidden h-2 w-2 border border-secondary bg-primary-container sm:block"
              aria-hidden
            />
            <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">
              {site.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-3 font-display text-xl text-secondary/90 sm:text-2xl">
              <span className="h-[2px] w-5 shrink-0 bg-secondary/50" />
              Senior Frontend Engineer
            </p>
          </div>
          <SocialIcons />
        </header>

        <section
          className="mt-14 sm:mt-16"
          aria-labelledby="live-projects-heading"
        >
          <h2
            id="live-projects-heading"
            className="font-display text-[11px] uppercase tracking-[0.25em] text-secondary"
          >
            <span className="text-secondary/50">&gt; </span>live_projects
          </h2>
          <ol className="mt-6 list-none pl-0">
            {site.liveProjects.map((project: LiveProject) => (
              <ProjectRow
                key={project.title}
                title={project.title}
                description={project.description}
                tech={project.tech}
                url={project.url}
              />
            ))}
          </ol>
        </section>

        <section
          className="mt-14 sm:mt-16"
          aria-labelledby="building-projects-heading"
        >
          <h2
            id="building-projects-heading"
            className="font-display text-[11px] uppercase tracking-[0.25em] text-secondary"
          >
            <span className="text-secondary/50">&gt; </span>building
          </h2>
          <ol className="mt-6 list-none pl-0">
            {site.buildingProjects.map((project: BuildingProject) => (
              <ProjectRow
                key={project.title}
                title={project.title}
                description={project.description}
                tech={project.tech}
                url={project.url}
                githubUrl={project.githubUrl}
                comingSoon={project.comingSoon}
                status="BUILDING"
              />
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
