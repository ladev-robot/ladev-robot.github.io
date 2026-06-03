import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import LinkButton from "../components/LinkButton";
import { siteConfig } from "@/constants/site";


const HeroSection: React.FC = () => {
  const sectionRef = useRef(null);
  const q = gsap.utils.selector(sectionRef);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const r = 10;
    const circumference = 2 * Math.PI * r;
    const circle = progressCircleRef.current;
    if (!circle) return;

    circle.style.strokeDasharray = `${circumference}`;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      const clamped = Math.min(1, Math.max(0, progress));
      const offset = circumference * (1 - clamped);
      circle.style.strokeDashoffset = `${offset}`;
    };

    const requestUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // bg text parallax effect
    gsap.to(q(".bg-text"), {
      scrollTrigger: {
        trigger: q(".bg-text"),
        scrub: true,
      },
      y: 350,
    });

    // text animation after initial load
    let tl = gsap.timeline({ defaults: { stagger: 0.2, duration: 0.3 } });
    tl.fromTo(q(".text-animation"), { y: 100 }, { y: 0, delay: 1 });

    // NOTE: illustration animation removed (personal customization)
  }, [q]);

  return (
    <section
      ref={sectionRef}
      className="relative mt-16 sm:mt-8 pt-8 lg:pt-0 px-4 sm:px-8 md:px-20 max-w-5xl sm:pb-24 min-h-[769px] mx-auto sm:flex sm:flex-col sm:justify-center sm:items-center lg:flex-row-reverse"
    >
      <span
        aria-hidden="true"
        className="bg-text absolute -top-36 rotate-12 text-gray-100 dark:text-[#1f2e3a] text-9xl scale-150 tracking-wide font-bold select-none pointer-events-none text-center z-0"
      >
        Plan. Control. Fly.
      </span>

      <div className="hidden lg:block lg:basis-1/3" aria-hidden="true" />

      <div className="lg:basis-2/3 z-10 relative">
        <span className="text-marrsgreen lg:text-lg font-medium dark:text-carrigreen">
          Hi my name is
        </span>
        <div className="overflow-hidden">
          <h1 className="text-animation text-4xl md:text-5xl lg:text-7xl md:my-2 font-semibold my-1">
            {siteConfig.name}
          </h1>
        </div>
        <div className="overflow-hidden">
          <span className="text-animation text-2xl md:text-3xl lg:text-5xl block md:my-3 text-marrsgreen dark:text-carrigreen font-medium">
            {siteConfig.title}
          </span>
        </div>
        <div className="mt-2 my-4 md:mb-8">
          <p className="mb-1">
          I build autonomous UAV navigation systems that go from simulation to real hardware flight.
          </p>
          <p>
          With experience in ROS, PX4, C++, and trajectory optimization, I enjoy turning complex planning algorithms into drones that actually fly.
          </p>
        </div>
        <LinkButton href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}>
          Contact me!
        </LinkButton>
      </div>
      <a
        href="#whoami"
        className="group absolute link-outline hidden md:bottom-14 lg:bottom-16 left-1/2 transform -translate-x-1/2 md:flex items-center flex-col"
      >
        <div className="flex items-center gap-2">
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            aria-hidden="true"
            className="text-marrsgreen dark:text-carrigreen"
          >
            <circle
              cx="13"
              cy="13"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
            <circle
              cx="13"
              cy="13"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              ref={progressCircleRef}
              transform="rotate(-90 13 13)"
            />
          </svg>
          <span className="tracking-wide group-hover:text-marrsgreen dark:group-hover:text-carrigreen">
            Navigate
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          className="dark:fill-bglight group-hover:fill-marrsgreen dark:group-hover:fill-carrigreen"
        >
          <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
        </svg>
      </a>
    </section>
  );
};

export default HeroSection;
