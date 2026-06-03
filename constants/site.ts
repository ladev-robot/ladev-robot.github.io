export const siteConfig = {
  name: "Leo",
  title: "A Planning & Control Engineer",
  domain: "Leo.dev",
  siteName: "Leo.dev",
  location: "your city, your country",
  description:
    "Ao is a software developer passionate about building web applications and sharing knowledge through code and writing.",
  blogDescription:
    "Articles about programming, coding, technologies, software engineering, personal projects, and experiences.",
  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://www.linkedin.com/in/yourusername/",
    devto: "https://dev.to/yourusername",
    facebook: "https://www.facebook.com/yourprofile",
  },
  ogImages: {
    home: "/og-home.png",
    blog: "/og-blog.png",
  },
  images: {
    profile: "/profile.webp",
    heroIllustration: "/hero-illustration.webp",
  },
};

export const pageTitle = (suffix?: string) =>
  suffix ? `${suffix} - ${siteConfig.name}` : `${siteConfig.name} - ${siteConfig.title}`;

export const blogPageTitle = (suffix?: string) =>
  suffix ? `${suffix} - ${siteConfig.name}` : `Blog - ${siteConfig.name}`;
