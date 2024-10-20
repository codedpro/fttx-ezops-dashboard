"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { Background } from "@/components/Error/Background";
import Link from "next/link";

const GlobalError = () => {
  const errorTextRef = useRef(null);
  const messageRef = useRef(null);
  const buttonRef = useRef(null);
  const backgroundRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    gsap.fromTo(
      backgroundRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: "bounce.out" }
    );

    gsap.fromTo(
      [errorTextRef.current, messageRef.current, buttonRef.current],
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.3,
        delay: 0.6,
      }
    );
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">
      <Background ref={backgroundRef} className="max-w-4xl mx-auto pb-40">
        <div className="text-center">
          <h1
            ref={errorTextRef}
            className="text-7xl font-bold mb-6 text-primary"
          >
            Oops!
          </h1>
          <p ref={messageRef} className="text-xl mb-8 text-gray-300">
            Something went wrong. We couldn’t complete your request.
          </p>
          <Link
            ref={buttonRef}
            href={"/"}
            className="bg-primary text-black px-6 py-3 rounded font-semibold hover:bg-primaryhover hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring focus:ring-primary"
          >
            Return to Dashboard
          </Link>
        </div>
      </Background>
    </div>
  );
};

export default GlobalError;
