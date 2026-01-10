"use client";

import { StripedPattern } from "./magicui/striped-pattern";
import { AuroraText } from "./ui/aurora-text";
import {
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandLinkedin,
  IconHeart,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Questions", href: "/questions" },
    { title: "Leaderboard", href: "/leaderboard" },
    { title: "Ask Question", href: "/questions/ask" },
  ];

  const legalLinks = [
    { title: "About", href: "/about" },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms of Service", href: "/terms-of-service" },
  ];

  const socialLinks = [
    {
      icon: <IconBrandGithub className="h-5 w-5" />,
      href: "https://github.com/MKaczor24",
      label: "GitHub",
    },
    {
      icon: <IconBrandDiscord className="h-5 w-5" />,
      href: "https://discord.com",
      label: "Discord",
    },
    {
      icon: <IconBrandLinkedin className="h-5 w-5" />,
      href: "https://linkedin.com/",
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-neutral-50/20 bg-neutral-950/80 text-neutral-50 backdrop-blur-xl">
      <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-blue-500/20 via-purple-500 to-pink-500/20" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-1 lg:col-span-2">
            <Link
              href="/"
              className="group relative z-10 flex items-center gap-2"
            >
              <Image
                src="public/logo.svg"
                alt="HeapUnderflow logo"
                width={40}
                height={40}
                className="rounded-md transition-transform duration-300 group-hover:scale-115 group-hover:rotate-180"
              />
              <span className="relative">
                <AuroraText className="text-2xl font-bold">
                  HeapUnderflow
                </AuroraText>
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
              A community-driven platform for developers to ask questions, share
              knowledge, and grow together.
            </p>
            <div className="mt-2 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  aria-label={social.label}
                  className="flex items-center justify-center rounded-full bg-neutral-800/50 p-2 text-neutral-400 transition duration-300 hover:bg-neutral-700 hover:text-neutral-50 hover:shadow-inner"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              Navigate
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition duration-300 hover:text-neutral-50"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition duration-300 hover:text-neutral-50"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-6 md:flex-row">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} HeapUnderflow. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-neutral-500">
            Made with <IconHeart className="h-4 w-4 text-pink-500" /> by the
            community
          </p>
        </div>
      </div>

      <StripedPattern className="pointer-events-none absolute inset-0 mask-[radial-gradient(500px_circle_at_center,gray,transparent)] opacity-30" />
    </footer>
  );
}
