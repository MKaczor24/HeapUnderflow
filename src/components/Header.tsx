"use client";

import { useAuthStore } from "@/store/Auth";
import slugify from "@/helpers/slugify";
import {
  IconHome,
  IconWorldQuestion,
  IconLogin,
  IconUser,
  IconSearch,
  IconLaurelWreath,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { ShineBorder } from "./ui";
import { AuroraText } from "./ui/aurora-text";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, session } = useAuthStore();

  const router = useRouter();

  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const query = formData.get("search") as string | null;

    if (query) {
      router.push(`/questions?search=${encodeURIComponent(query)}`);
    }
  };

  const navItems = [
    {
      title: "Home",
      icon: <IconHome className="h-4 w-4 text-neutral-100" />,
      href: "/",
    },
    {
      title: "Questions",
      icon: <IconWorldQuestion className="h-4 w-4 text-neutral-100" />,
      href: "/questions",
    },
    {
      title: "Leaderboard",
      icon: <IconLaurelWreath className="h-4 w-4 text-neutral-100" />,
      href: "/leaderboard",
    },
    {
      title: user ? "Profile" : "Login",
      icon: user ? (
        <IconUser className="h-4 w-4 text-neutral-100" />
      ) : (
        <IconLogin className="h-4 w-4 text-neutral-100" />
      ),
      href: user
        ? `/users/${user.$id}/${slugify(user.name || "user")}`
        : "/login",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 flex w-full items-center justify-center px-2 pt-4 text-neutral-50 transition-all duration-300 ${
        isScrolled ? "pt-2" : ""
      }`}
    >
      <div
        className={`relative flex w-full max-w-7xl items-center justify-between gap-4 overflow-hidden rounded-2xl border border-neutral-50/10 px-4 py-2 shadow-xl backdrop-blur-xl transition-all duration-300 lg:grid lg:grid-cols-3 lg:gap-6 ${
          isScrolled ? "bg-neutral-950/50 shadow-2xl" : "bg-neutral-50/5"
        }`}
      >
        <ShineBorder
          shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
          className="absolute inset-0"
        />
        <Link href="/" className="group relative z-10 flex items-center gap-2">
          <Image
            src="/logo.png"
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
        <nav className="hidden w-full items-center justify-center gap-4 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`relative z-10 flex items-center gap-2 rounded-full px-3 py-1 shadow-neutral-950 transition duration-300 hover:bg-neutral-700/80 hover:shadow-inner ${
                isActive(item.href)
                  ? "bg-neutral-700/80 shadow-inner ring-1 ring-purple-500/50"
                  : ""
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        <div className="hidden w-full flex-row items-end justify-end gap-2 lg:flex">
          <form
            className="flex max-w-1/2 items-center rounded-full bg-neutral-700/80 px-3 py-1 shadow-inner shadow-neutral-950 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-0"
            onSubmit={handleSearch}
          >
            <IconSearch className="relative z-10 h-4 w-4" />
            <input
              type="text"
              name="search"
              placeholder="Search..."
              className="relative z-10 w-full border-none bg-transparent px-2 py-1 text-neutral-50 outline-none placeholder:text-neutral-400"
            />
          </form>
          {session ? (
            <Link
              href="/questions/ask"
              className="relative z-10 rounded-full border-none bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 text-base font-semibold text-neutral-50 shadow-md shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner"
            >
              Ask Question
            </Link>
          ) : (
            <Link
              href="/register"
              className="relative z-10 rounded-full border-none bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 text-base font-semibold text-neutral-50 shadow-md shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner"
            >
              Get Started
            </Link>
          )}
        </div>
        <button
          className="relative z-20 flex items-center justify-center rounded-full p-2 transition hover:bg-neutral-300 hover:shadow-inner lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <IconX className="h-6 w-6" />
          ) : (
            <IconMenu2 className="h-6 w-6" />
          )}
        </button>
      </div>
      {mobileMenuOpen && (
        <div
          className={`fixed inset-0 z-40 flex h-full flex-col items-center bg-neutral-950/50 pt-24 backdrop-blur-xl duration-300 lg:hidden ${isClosing ? "animate-out fade-out slide-out-to-top-5" : "animate-in fade-in slide-in-from-top-5"}`}
        >
          <button
            className="absolute top-15 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center rounded-full bg-neutral-800 p-3 text-neutral-50 shadow-lg transition hover:bg-neutral-700"
            onClick={handleCloseMenu}
            aria-label="Close menu"
          >
            <IconX className="h-6 w-6" />
          </button>
          <nav className="flex flex-col items-center gap-4 px-6 py-8">
            <form
              className="mb-2 flex w-full max-w-xs items-center rounded-full bg-neutral-700/80 px-4 py-2 shadow-inner shadow-neutral-950 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-0"
              onSubmit={handleSearch}
            >
              <IconSearch className="h-5 w-5 text-neutral-400" />
              <input
                type="text"
                name="search"
                placeholder="Search..."
                className="w-full border-none bg-transparent px-3 py-1 text-neutral-50 outline-none placeholder:text-neutral-400"
              />
            </form>
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={handleCloseMenu}
                className={`flex w-full items-center justify-center gap-3 rounded-full px-4 py-3 text-lg font-medium text-neutral-50 transition hover:bg-neutral-800 ${
                  isActive(item.href)
                    ? "bg-neutral-700/80 shadow-inner ring-1 shadow-neutral-950 ring-purple-500/50"
                    : "bg-neutral-500/80"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
            {session ? (
              <Link
                href="/questions/ask"
                onClick={handleCloseMenu}
                className="mt-2 w-full max-w-xs rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 text-center text-lg font-semibold text-neutral-50 shadow-lg transition hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
              >
                Ask Question
              </Link>
            ) : (
              <Link
                href="/register"
                onClick={handleCloseMenu}
                className="mt-2 w-full max-w-xs rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 text-center text-lg font-semibold text-neutral-50 shadow-lg transition hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
              >
                Get Started
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
