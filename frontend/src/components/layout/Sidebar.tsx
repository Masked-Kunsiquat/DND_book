import { Sidebar } from "flowbite-react";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineMap,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineArrowRight,
} from "react-icons/hi";

export function SidebarComponent() {
  return (
    <Sidebar aria-label="DND Book Sidebar" className="w-64 border-r h-screen">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {/* Main Pages */}
          <Sidebar.Item href="/dashboard" icon={HiOutlineHome}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item href="/npcs" icon={HiOutlineUsers}>
            NPCs
          </Sidebar.Item>
          <Sidebar.Item href="/locations" icon={HiOutlineMap}>
            Locations
          </Sidebar.Item>
          <Sidebar.Item href="/notes" icon={HiOutlineDocumentText}>
            Notes
          </Sidebar.Item>

          {/* Expandable Section */}
          <Sidebar.Collapse icon={HiOutlineBookOpen} label="Campaigns">
            <Sidebar.Item href="#">Quests</Sidebar.Item>
            <Sidebar.Item href="#">Lore</Sidebar.Item>
            <Sidebar.Item href="#">Encounters</Sidebar.Item>
          </Sidebar.Collapse>

          {/* Settings */}
          <Sidebar.Item href="/settings" icon={HiOutlineCog}>
            Settings
          </Sidebar.Item>

          {/* Authentication */}
          <Sidebar.Item href="/login" icon={HiOutlineArrowRight}>
            Sign In
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
