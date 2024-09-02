"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import Signin from "@/components/Auth/Signin";

import logoDark from "../../../../public/images/logo/logo-dark.png";
import gridImage from "../../../../public/images/grids/grid-02.svg";
import { BackgroundBeams } from "@/components/ui/background-beams";

const Logo: React.FC = () => {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.5, rotation: -180 },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
        delay: 0.3,
      }
    );

    const logoElement = logoRef.current;
    if (logoElement && window.innerWidth > 768) {
      gsap.set(logoElement, { transformPerspective: 1000 });

      const handleMouseMove = (event: MouseEvent) => {
        const rect = logoElement.getBoundingClientRect();
        const logoX = rect.left + rect.width / 2;
        const logoY = rect.top + rect.height / 2;
        const deltaX = event.clientX - logoX;
        const deltaY = event.clientY - logoY;

        const rotationY = deltaX / 5;
        const rotationX = -deltaY / 5;

        gsap.to(logoElement, {
          rotationY: rotationY,
          rotationX: rotationX,
          ease: "power2.out",
          duration: 0.2,
        });
      };

      logoElement.addEventListener("mouseenter", () => {
        gsap.to(logoElement, {
          scale: 1.15,
          ease: "power3.out",
          duration: 0.6,
        });

        window.addEventListener("mousemove", handleMouseMove);
      });

      logoElement.addEventListener("mouseleave", () => {
        gsap.to(logoElement, {
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          ease: "power3.out",
          duration: 0.6,
        });

        window.removeEventListener("mousemove", handleMouseMove);
      });
    }
  }, []);

  return (
    <>
      <Image
        className="block select-none "
        src={logoDark}
        alt="Logo"
        width={176}
        height={32}
        ref={logoRef}
        draggable="false"
      />
    </>
  );
};

const SignIn: React.FC = () => {
  const contentRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    const elements = gsap.utils.toArray(".animate-content");

    tl.fromTo(
      elements,
      { opacity: 0, y: 40, rotationX: 90 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
        stagger: 0.3,
      }
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-dark-4 relative flex flex-col items-center justify-center antialiased ">
      <div className="z-30 hidden sm:flex">
        <BackgroundBeams />
      </div>
      <div className="w-full max-w-md z-40 px-4 md:px-0 my-4 md:my-0 ">
        <div className="w-full">
          <div
            ref={contentRef}
            className="overflow-hidden rounded-2xl p-6 md:px-10 md:pt-10 bg-dark-6"
          >
            <div className="mb-8 flex justify-center items-center animate-content">
              <Logo />
            </div>
            <div className="w-full">
              <Signin />
            </div>

            <div className="mt-10 animate-content">
              <Image
                src={gridImage}
                alt="Grid"
                width={300}
                height={240}
                className="mx-auto opacity-30"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
