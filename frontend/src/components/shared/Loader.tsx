import { Spinner } from "flowbite-react";

export function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}
