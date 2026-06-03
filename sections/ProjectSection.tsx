import Image from "next/image";
import { useEffect, useRef } from "react";
import { RoughNotation } from "react-rough-notation";
import { useTheme } from "next-themes";

import ProjectCard from "@/components/ProjectCard";
import { useSection } from "context/section";
import useOnScreen from "hooks/useOnScreen";
import useScrollActive from "hooks/useScrollActive";
import { siteConfig } from "@/constants/site";

import personalBlog from "public/projects/personal-blog.webp";

const ProjectSection: React.FC = () => {
  const { theme } = useTheme();

  const sectionRef = useRef<HTMLDivElement>(null);

  const elementRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(elementRef);

  // Set active link for project section
  const projectSection = useScrollActive(sectionRef);
  const { onSectionChange } = useSection();
  useEffect(() => {
    projectSection && onSectionChange!("projects");
  }, [onSectionChange, projectSection]);

  return (
    <section ref={sectionRef} id="projects" className="section">
      <div className="project-title text-center">
        <RoughNotation
          type="underline"
          color={`${theme === "light" ? "rgb(0, 122, 122)" : "rgb(5 206 145)"}`}
          strokeWidth={2}
          order={1}
          show={isOnScreen}
        >
          <h2 className="section-heading">Featured Projects</h2>
        </RoughNotation>
      </div>
      <span className="project-desc text-center block mb-4" ref={elementRef}>
        Here are some projects I have built. More work can be found on my GitHub
        profile.
      </span>
      <div className="flex flex-wrap">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} index={index} project={project} />
        ))}
      </div>
      <div className="others text-center mb-16">
        Other projects can be explored in{" "}
        <a
          href={siteConfig.social.github}
          className="font-medium underline link-outline text-marrsgreen dark:text-carrigreen whitespace-nowrap"
        >
          my github profile
        </a>
      </div>
    </section>
  );
};

const projects = [
  {
    title: "Personal Blog",
    type: "Full-stack",
    image: (
      <Image
        src={personalBlog}
        sizes="100vw"
        fill
        alt="Personal Blog"
        className="transition-transform duration-500 hover:scale-110 object-cover"
      />
    ),
    desc: "A personal portfolio and blog built with Next.js, TypeScript, and Tailwind CSS.",
    tags: ["Next.js", "TypeScript", "React", "TailwindCSS"],
    liveUrl: process.env.NEXT_PUBLIC_URL ?? "/",
    codeUrl: siteConfig.social.github,
    bgColor: "bg-[#9FD0E3]",
    githubApi: "",
  },
];

export default ProjectSection;
