import type { CSSProperties, ReactNode } from "react";
import { desktopLayouts, mobileLayouts, type Slot } from "@/app/components/layouts";
import { Scatter } from "@/app/components/Scatter";
import { SocialIcons } from "@/app/components/SocialIcons";
import { Highlighter } from "@/app/components/Highlighter";
import { site } from "@/lib/site";

const ROLE_ACCENT = "Full Stack";

const projects = [
  ...site.liveProjects.map((p) => ({
    title: p.title,
    description: p.description,
    tech: p.tech,
    href: p.url,
    status: "Live",
  })),
  ...site.buildingProjects.map((p) => ({
    title: p.title,
    description: p.description,
    tech: p.tech,
    href: p.githubUrl ?? p.url,
    status: p.comingSoon ? "Soon" : "Building",
  })),
];

const tilts = ["-3deg", "2.5deg", "2deg", "-2.5deg"];

// The track scrolls by half its width; four copies keep a long strip filled.
const STRIP_COPIES = [0, 1, 2, 3];

const vars = (v: Record<string, string>) => v as CSSProperties;

type PieceProps = {
  slot: Slot;
  className?: string;
  tilt?: string;
  as?: "div" | "li";
  children: ReactNode;
};

/**
 * One piece of the site. The outer node only places it on the screen;
 * <Scatter /> re-deals its position in the browser.
 */
function Piece({ slot, className = "", tilt, as: Tag = "div", children }: PieceProps) {
  // Server-rendered default spot; <Scatter /> re-deals it in the browser.
  const [x, y] = desktopLayouts[0][slot];
  const [mx, my] = mobileLayouts[0][slot];
  return (
    <Tag
      data-slot={slot}
      className="pointer-events-auto absolute left-[var(--mx)] top-[var(--my)] -translate-x-1/2 -translate-y-1/2 lg:left-[var(--x)] lg:top-[var(--y)]"
      style={vars({
        "--x": `${x}%`,
        "--y": `${y}%`,
        "--mx": `${mx}%`,
        "--my": `${my}%`,
      })}
    >
      <div
        className={`tilt ${className}`}
        style={tilt ? vars({ "--tilt": tilt }) : undefined}
      >
        {children}
      </div>
    </Tag>
  );
}

function Role() {
  const [before, after] = site.role.split(ROLE_ACCENT);
  if (after === undefined) return <>{site.role}</>;
  return (
    <>
      {before}
      <em className="neon-orange font-serif text-[1.2em] font-normal italic text-secondary">
        {ROLE_ACCENT}
      </em>
      {after}
    </>
  );
}

export default function Home() {
  return (
    <main>
      <Highlighter>
        <Scatter />
        <div className="backdrop absolute inset-0 overflow-hidden">
          <Piece
            slot="hero"
            tilt="-2deg"
            className="w-[92vw] text-center lg:w-[52vw] lg:max-w-[740px]"
          >
            <h1 className="neon-white relative font-marker text-[clamp(2.4rem,min(9vw,14vh),6.5rem)] leading-[0.95] text-white">
              {site.name}
              <svg
                aria-hidden
                viewBox="0 0 400 20"
                preserveAspectRatio="none"
                className="scribble absolute -bottom-2 left-[8%] h-3 w-[84%] text-secondary sm:h-4"
              >
                <path
                  pathLength={1}
                  d="M4 12 C 60 2, 110 18, 170 9 S 290 4, 396 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p className="mt-4 text-xl font-extrabold uppercase leading-tight tracking-tight text-white sm:mt-6 sm:text-4xl">
              <Role />
            </p>
            <p className="mt-1 font-serif text-base italic text-on-surface-variant [@media(max-height:700px)]:hidden sm:text-xl">
              {site.subtitleLine}
            </p>
          </Piece>

          <Piece
            slot="bio"
            tilt="-1.5deg"
            className="w-[78vw] max-w-sm lg:w-[26vw]"
          >
            <p className="text-sm leading-snug text-white sm:text-lg">
              {site.tagline}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full [@media(max-height:700px)]:hidden border border-white/15 px-3 py-1 text-xs font-semibold text-on-surface-variant sm:text-sm">
              <span aria-hidden className="size-2 rounded-full bg-secondary" />
              {site.location}
            </p>
          </Piece>

          <section
            aria-labelledby="projects-heading"
            className="pointer-events-none absolute inset-0"
          >
            <h2 id="projects-heading" className="sr-only">
              Projects
            </h2>
            <ul className="pointer-events-none absolute inset-0">
              {projects.map((project, i) => (
                <Piece
                  key={project.title}
                  as="li"
                  slot={`p${i}` as Slot}
                  tilt={tilts[i % tilts.length]}
                  className="sticker relative flex w-[42vw] max-w-[320px] flex-col gap-1.5 rounded-3xl border border-white/15 bg-neutral-900/70 p-3 text-left backdrop-blur-sm lg:w-[22vw] sm:gap-2 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <h3 className="text-base font-bold leading-tight text-white sm:text-2xl">
                      {project.href ? (
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        >
                          {project.title}
                          <span aria-hidden className="ml-1 text-secondary">
                            ↗
                          </span>
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white sm:px-2.5 sm:text-[11px]">
                      <span
                        aria-hidden
                        className={`size-2 rounded-full ${
                          project.status === "Live"
                            ? "live-dot bg-secondary"
                            : "bg-on-surface-variant"
                        }`}
                      />
                      {project.status}
                    </span>
                  </div>
                  <p className="hidden text-sm leading-snug text-on-surface-variant [@media(min-width:1024px)_and_(min-height:900px)]:line-clamp-3 [@media(min-width:1024px)_and_(min-height:900px)]:block">
                    {project.description}
                  </p>
                  <p className="text-[11px] font-medium text-secondary/90 [@media(max-height:700px)]:hidden sm:text-xs">
                    {project.tech.slice(0, 4).join(" · ")}
                  </p>
                </Piece>
              ))}
            </ul>
          </section>

          <Piece slot="contact" className="w-max text-center">
            <nav aria-label="Contact and social links">
              <p className="mb-2 font-serif text-xl italic text-on-surface-variant [@media(max-height:700px)]:hidden sm:text-2xl">
                come say hi
              </p>
              <SocialIcons />
            </nav>
          </Piece>

          {/* Outer node places and rotates the strip; <Scatter /> sets its vars. */}
          <div
            data-banner
            className="pointer-events-auto absolute left-[var(--bx)] top-[var(--by)] w-[var(--bw)] [transform:translate(-50%,-50%)_rotate(var(--brot))]"
            style={vars({
              "--bx": "50%",
              "--by": "calc(100% - 28px)",
              "--bw": "100%",
              "--brot": "0deg",
            })}
          >
            <div
              data-marquee
              className="overflow-hidden border-y border-white/10 bg-black/50 py-2 sm:py-3"
            >
              <div className="marquee-track flex w-max">
                {STRIP_COPIES.map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy > 0 || undefined}
                    aria-label={copy > 0 ? undefined : "Core stack"}
                    className="flex shrink-0 items-center"
                  >
                    {site.skillsHighlight.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-center text-base font-extrabold uppercase tracking-tight sm:text-2xl"
                      >
                        <span className="outline-text px-3 sm:px-5">{skill}</span>
                        <span aria-hidden className="text-secondary">
                          ✦
                        </span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Highlighter>
    </main>
  );
}
