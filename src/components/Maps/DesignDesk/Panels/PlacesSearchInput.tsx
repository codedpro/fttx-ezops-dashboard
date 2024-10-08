import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { gsap } from "gsap";

const PlacesSearchInput: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchIconRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (searchQuery && searchQuery !== "") {
      onSearch(searchQuery);

      gsap.fromTo(
        searchIconRef.current,
        { scale: 1, rotate: 0 },
        {
          scale: 1.3,
          rotate: 360,
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            gsap.fromTo(
              searchIconRef.current,
              { scale: 1.3 },
              { scale: 1, duration: 0.2, ease: "power2.out" }
            );
          },
        }
      );

      gsap.fromTo(
        searchIconRef.current,
        { filter: "brightness(1)" },
        { filter: "brightness(2)", duration: 0.3, repeat: 3, yoyo: true }
      );

      const sparkles = gsap.timeline();
      sparkles.to(containerRef.current, {
        boxShadow: "0 0 20px rgba(255, 255, 255, 0.8)",
        duration: 0.5,
        ease: "power3.out",
      });
      sparkles.to(containerRef.current, {
        boxShadow: "0 0 0px rgba(255, 255, 255, 0)",
        duration: 0.3,
        ease: "power3.inOut",
        delay: 0.2,
      });
      sparkles.play();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    gsap.fromTo(
      searchBarRef.current,
      { y: -120, scale: 0.5 },
      {
        y: 0,
        scale: 1,
        duration: 1.5,
        ease: "elastic.out(1, 0.75)",
        delay: 0.2,
      }
    );

    const placeholderText = "Search places...";
    let currentCharIndex = 0;
    const typePlaceholder = () => {
      if (inputRef.current) {
        inputRef.current.setAttribute(
          "placeholder",
          placeholderText.slice(0, currentCharIndex)
        );
        currentCharIndex++;
        if (currentCharIndex <= placeholderText.length) {
          setTimeout(typePlaceholder, 200);
        } else {
          setTimeout(() => {
            currentCharIndex = 0;
            typePlaceholder();
          }, 8000);
        }
      }
    };
    typePlaceholder();
  }, []);

  return (
    <div
      className="w-full flex justify-center p-4 absolute top-0 z-10"
      ref={searchBarRef}
    >
      <div
        ref={containerRef}
        className="flex items-center bg-white bg-opacity-50 dark:bg-gray-700 h-12 dark:bg-opacity-60 backdrop-blur-lg p-2 rounded-2xl shadow-md w-full max-w-sm sm:max-w-xs transition-transform duration-300 ease-in-out mx-2 hover:shadow-lg hover:scale-105"
      >
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-grow p-2 bg-transparent border-none outline-none placeholder:text-gray-600 dark:placeholder:text-gray-400 text-gray-800 dark:text-white transition-opacity duration-300 ease-in-out text-sm sm:text-base"
        />
        <div ref={searchIconRef}>
          <FaSearch
            className="text-gray-700 dark:text-gray-300 mr-2 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-110"
            onClick={handleSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default PlacesSearchInput;
