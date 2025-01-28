import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const location = useLocation();

    // Define navigation links
    const navLinks = [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/notes", label: "Notes" },
        { path: "/locations", label: "Locations" },
        { path: "/npcs", label: "NPCs" },
    ];

    return (
        <nav style={{ textAlign: "center", padding: "10px", background: "#f0f0f0" }}>
            {navLinks.map((link) => (
                <Link
                    key={link.path}
                    to={link.path}
                    style={{
                        margin: "0 15px",
                        textDecoration: "none",
                        color: location.pathname === link.path ? "blue" : "black",
                    }}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
};

export default Navbar;
