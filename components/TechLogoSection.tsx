"use client";

import LogoLoop from "./LogoLoop";

const techLogos = [
  {
    src: "https://tse2.mm.bing.net/th/id/OIP.g92gY5wUYa-AkF93dm8piQHaCp?pid=Api&h=220&P=0 ",
    alt: "React",
    href: "https://react.dev",
  },
  {
    src: "https://freepnglogo.com/images/all_img/1707659567disney-logo-white.png",
    alt: "Next.js",
    href: "https://nextjs.org",
  },
  {
    src: "https://logonoid.com/images/no-fear-logo.png",
    alt: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  {
    src: "https://freelogopng.com/images/all_img/1688382512Jordan-logo-white-png.png",
    alt: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
];

export default function App() {
  return (
    <div className="h-[90px] flex items-center my-2 overflow-hidden">
      <LogoLoop
        logos={techLogos}
        speed={100}
        direction="left"
        logoHeight={60}
        gap={60}
        hoverSpeed={0}
        scaleOnHover
        ariaLabel="Technology partners"
      />
    </div>
  );
}