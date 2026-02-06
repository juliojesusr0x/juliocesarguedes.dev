import Image from "next/image";
import { site } from "@/lib/site";
import { SocialIcons } from "@/app/components/SocialIcons";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
        {/* Hero: image → name → tagline → description */}
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/me.png"
            alt=""
            width={144}
            height={144}
            priority
            sizes="144px"
            className="rounded-full border border-[var(--border)]"
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {site.name}
            </h1>
            <p className="font-mono text-sm text-zinc-500 sm:text-base">
              {site.tagline}
            </p>
          </div>
          <p className="text-zinc-400 text-pretty text-lg leading-relaxed max-w-xl">
            {site.description}
          </p>
        </div>

        {/* Contact: icons only */}
        <div className="mt-10">
          <SocialIcons />
        </div>

        {/* Tech stack pills */}
        <section className="mt-16" aria-labelledby="tech-stack-heading">
          <h2
            id="tech-stack-heading"
            className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4"
          >
            Tech stack
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {site.techStack.map((tech) => (
              <span
                key={tech}
                className="font-mono text-xs px-3 py-1.5 rounded border border-[var(--border)] text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Thin separator */}
        <hr className="my-12 border-[var(--border)]" />

        {/* Current projects: rows */}
        <section className="text-left" aria-labelledby="projects-heading">
          <h2
            id="projects-heading"
            className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-4 text-center"
          >
            Current projects
          </h2>
          {site.projects.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm">
              Currently focused on building this site and next opportunities.
            </p>
          ) : (
            <ul className="space-y-4">
              {site.projects.map((project) => (
                <li
                  key={project.title}
                  className="flex flex-col gap-1 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {project.title}
                    </span>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        View →
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">{project.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
