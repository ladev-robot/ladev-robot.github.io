import { useSection } from "context/section";
import { socialLinks } from "@/constants/socialLinks";

const SocialLinks: React.FC<{ page?: string }> = ({ page }) => {
  const { currentSection } = useSection();
  return (
    <>
      {page === "index" ? (
        <div className="hidden fixed left-10 bottom-1/3 md:flex flex-col w-6 h-52 items-center justify-between">
          {navLinks.map((nav) => {
            return (
              <a
                title={nav.text}
                href={nav.url}
                key={nav.url}
                className={`transition-all outline-marrsdark dark:outline-textlight hover:bg-marrsgreen dark:hover:bg-carrigreen ${
                  currentSection === nav.text.toLowerCase()
                    ? "bg-marrsgreen dark:bg-carrigreen rotate-0"
                    : "opacity-50 focus-visible:opacity-100 hover:opacity-80 rotate-45 hover:rotate-12"
                } w-3 h-3 border-2 border-marrsgreen dark:border-carrigreen`}
              ></a>
            );
          })}
        </div>
      ) : (
        <div className="hidden fixed left-10 bottom-0 md:flex flex-col w-6 h-56 items-center justify-between">
          <div className="-rotate-90 text-lg tracking-widest">
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
              className="link-outline hover:text-marrsgreen dark:hover:text-carrigreen"
            >
              {process.env.NEXT_PUBLIC_EMAIL}
            </a>
          </div>
          <div className="w-40 h-1 bg-bgdark dark:bg-bglight rotate-90"></div>
        </div>
      )}
      <div className="hidden fixed right-10 bottom-0 md:flex flex-col w-6 h-[17rem] items-center justify-between">
        <div className="flex flex-col space-y-6">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              title={social.title}
              href={social.link}
              className="scale-110 rounded link-outline"
            >
              {social.svg}
            </a>
          ))}
        </div>
        <div className="w-40 h-1 bg-bgdark dark:bg-bglight rotate-90"></div>
      </div>
    </>
  );
};

const navLinks = [
  {
    url: "#",
    text: "Welcome",
  },
  {
    url: "#whoami",
    text: "Who am i?",
  },
  {
    url: "#projects",
    text: "Projects",
  },
  {
    url: "#blog",
    text: "Blog",
  },
  {
    url: "#contact",
    text: "Contact",
  },
];

export default SocialLinks;
