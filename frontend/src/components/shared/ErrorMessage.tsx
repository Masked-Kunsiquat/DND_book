import { Alert } from "flowbite-react";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Alert color="failure">{message}</Alert>
    </div>
  );
}
