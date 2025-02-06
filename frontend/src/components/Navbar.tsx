import { Group, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router-dom";
import classes from "./css/Navbar.module.css";

const links = [
  { link: "/dashboard", label: "Dashboard" },
  { link: "/notes", label: "Notes" },
  { link: "/locations", label: "Locations" },
  { link: "/npcs", label: "NPCs" },
];

export function Navbar() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <h1 className={classes.logo}>DND Book</h1>
        <Group gap={20} className={classes.links}>
          {links.map((link) => (
            <Link key={link.label} to={link.link} className={classes.link}>
              {link.label}
            </Link>
          ))}
        </Group>

        <Group>
          <Burger opened={opened} onClick={toggle} className={classes.burger} />
        </Group>
      </div>
    </header>
  );
}

export default Navbar;
