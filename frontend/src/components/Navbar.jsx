import React from "react";
import { Navbar as FlowbiteNavbar, DarkThemeToggle, useThemeMode } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../img/logo_dnd.png";

const Navbar = () => {
  const { toggleMode } = useThemeMode(); // Use hook for toggling the theme
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/notes", label: "Notes" },
    { path: "/locations", label: "Locations" },
    { path: "/npcs", label: "NPCs" },
  ];

  return (
    <FlowbiteNavbar fluid rounded>
      <FlowbiteNavbar.Brand as="div">
        <Link to="/dashboard" className="flex items-center">
          <img src={logo} className="h-8" alt="DND Book Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            DND Book
          </span>
        </Link>
      </FlowbiteNavbar.Brand>

      <div className="flex md:order-2 items-center gap-4">
        {/* Dark Theme Toggle */}
        <DarkThemeToggle onClick={toggleMode} />
        <FlowbiteNavbar.Toggle />
      </div>

      <FlowbiteNavbar.Collapse>
        {navLinks.map((link) => (
          <FlowbiteNavbar.Link
            key={link.path}
            as={Link}
            to={link.path}
            active={location.pathname === link.path}
          >
            {link.label}
          </FlowbiteNavbar.Link>
        ))}
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
};

export default Navbar;
