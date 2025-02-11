import { DarkThemeToggle, Dropdown, Avatar } from "flowbite-react";

export function Navbar() {
  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-gray-800">
      <span className="text-xl font-semibold text-gray-900 dark:text-white">DND Book</span>
      <div className="flex items-center gap-4">
        <DarkThemeToggle />
        <Dropdown arrowIcon={false} inline label={<Avatar rounded />}>
          <Dropdown.Header>
            <span className="block text-sm text-gray-900 dark:text-white">John Doe</span>
            <span className="block truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              john@example.com
            </span>
          </Dropdown.Header>
          <Dropdown.Item>Profile</Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
      </div>
    </div>
  );
}
