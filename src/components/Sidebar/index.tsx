import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "react-pro-sidebar";
import {
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaCogs,
  FaWifi,
  FaChevronLeft,
  FaPaintBrush,
  FaFileExport,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import {
  PiDesk,
  PiMapPinArea,
  PiPaintBrush,
  PiPaintBrushBroad,
  PiPaintBrushBroadDuotone,
} from "react-icons/pi";
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const SidebarComponent = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isArrowClicked, setIsArrowClicked] = useState(true);

  useEffect(() => {
    setCollapsed(!sidebarOpen);
  }, [sidebarOpen]);

  const handleMouseEnter = () => {
    if (collapsed && !isArrowClicked) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!collapsed && !isArrowClicked) {
      setCollapsed(true);
    }
  };

  const toggleArrowBehavior = () => {
    setIsArrowClicked(!isArrowClicked);
    setCollapsed(false);
  };

  const darkModeStyles = {
    backgroundColor: "#1f2937",
    color: "#ffffff",
    borderColor: "#2d3748",
  };

  const lightModeStyles = {
    backgroundColor: "#ffffff",
    color: "#1f2937",
    borderColor: "#e2e8f0",
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      route: "/",
    },
    {
      label: "Map",
      icon: <FaMapMarkerAlt />,
      route: "/map",
    },
    {
      label: "Preorders",
      icon: <FaCogs />,
      route: "/preorders",
    },
    {
      label: "Modems",
      icon: <FaWifi />,
      route: "/modem",
    },
    {
      label: "Iran FTTX",
      icon: <PiMapPinArea />,
      route: "/iranfttx",
    },
    /*     {
      label: "Design Desk",
      icon: <FaPaintBrush />,
      route: "/design-desk",
    }, */
    {
      label: "Exports",
      icon: <FaFileExport />,
      route: "/exports",
    },
  ];

  if (!sidebarOpen) {
    return null;
  }

  return (
    <>
      <div className="hidden dark:flex z-30 transition-width duration-300 ease-in-out">
        <Sidebar
          collapsed={collapsed}
          toggled={sidebarOpen}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onBackdropClick={() =>
            window.innerWidth < 768 ? setSidebarOpen(false) : null
          }
          breakPoint="md"
          transitionDuration={90}
          backgroundColor={"#122031"}
          rootStyles={darkModeStyles}
        >
          <div className="sidebar-header flex items-center justify-center py-4">
            <Link href="/">
              <Image
                width={500}
                height={500}
                src="/images/logo/logo-dark.png"
                alt="Logo"
                priority
                className="dark:block w-36 hidden"
                draggable={false}
              />
            </Link>
            <Link href="/">
              <Image
                width={500}
                height={500}
                src="/images/logo/logo-light.png"
                alt="Logo"
                priority
                className="dark:hidden w-36"
                draggable={false}
              />
            </Link>
          </div>

          <ul>
            {sidebarItems.map((item, index) => (
              <SidebarItem key={index} item={item} collapsed={collapsed} />
            ))}
          </ul>

          <div
            onClick={toggleArrowBehavior}
            className="sidebar-footer absolute bottom-0 right-0 flex items-center justify-end py-2 pr-2 w-full bg-[#f3f4f6] dark:bg-[#122031] hover:opacity/80"
          >
            <FaChevronLeft
              size={20}
              className={`transition-transform text-dark dark:text-white ${
                isArrowClicked ? "" : "rotate-180"
              }`}
            />
          </div>
        </Sidebar>
      </div>
      <div className="flex dark:hidden transition-width duration-300 ease-in-out">
        <Sidebar
          collapsed={collapsed}
          toggled={sidebarOpen}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onBackdropClick={() =>
            window.innerWidth < 768 ? setSidebarOpen(false) : null
          }
          breakPoint="md"
          transitionDuration={90}
          backgroundColor={"#ffffff"}
          rootStyles={lightModeStyles}
        >
          <div className="sidebar-header flex items-center justify-center py-4">
            <Link href="/">
              <Image
                width={500}
                height={500}
                src="/images/logo/logo-dark.png"
                alt="Logo"
                priority
                className="dark:block w-36 hidden"
                draggable={false}
              />
            </Link>
            <Link href="/">
              <Image
                width={500}
                height={500}
                src="/images/logo/logo-light.png"
                alt="Logo"
                priority
                className="dark:hidden w-36"
                draggable={false}
              />
            </Link>
          </div>

          <ul>
            {sidebarItems.map((item, index) => (
              <SidebarItem key={index} item={item} collapsed={collapsed} />
            ))}
          </ul>

          <div
            onClick={toggleArrowBehavior}
            className="sidebar-footer absolute bottom-0 right-0 flex items-center justify-end py-2 pr-2 w-full bg-[#f3f4f6] dark:bg-[#122031] hover:opacity/80"
          >
            <FaChevronLeft
              size={20}
              className={`transition-transform text-dark dark:text-white ${
                isArrowClicked ? "" : "rotate-180"
              }`}
            />
          </div>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarComponent;
