"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/logo.png";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import UserDropDown from "./UserDropDown";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard" },
];

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-4">
          <Image src={Logo} alt="logo" className="size-9" />
          <span className="font-bold">LMS.</span>
        </Link>

        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            {navItems.map((i) => (
              <Link
                key={i.name}
                href={i.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {i.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            {isPending ? null : session ? (
              <UserDropDown
                email={session.user.email}
                name={
                  session?.user.name && session?.user.name.length > 0
                    ? session.user.name
                    : session?.user.email.split("@")[0]
                }
                image={
                  session?.user.image ??
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link href="/login" className={buttonVariants()}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
