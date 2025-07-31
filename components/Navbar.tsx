"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import NavItems from "./NavItems";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar relative">
      {/* Main navbar container */}
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <Image 
              src="/images/logo.svg" 
              alt="logo" 
              width={46} 
              height={44}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <NavItems />
          <SignedOut>
            <SignInButton>
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile: Auth + Menu Button */}
        <div className="lg:hidden flex items-center gap-4">
          {/* Priority Auth for Mobile */}
          <SignedOut>
            <SignInButton>
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col justify-center items-center w-6 h-6 space-y-1 focus:outline-none relative z-50"
            aria-label="Toggle mobile menu"
          >
            <span 
              className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            />
            <span 
              className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span 
              className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu - Only NavItems */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full right-0 bg-white shadow-md border rounded-md z-40 min-w-48">
          <div className="px-4 py-3">
            <div className="mobile-nav [&>nav]:!flex [&>nav]:!flex-col [&>nav]:!gap-4 [&>nav]:!items-start">
              <NavItems />
            </div>
          </div>
        </div>
      )}
      
    </nav>
  );
};

export default Navbar;