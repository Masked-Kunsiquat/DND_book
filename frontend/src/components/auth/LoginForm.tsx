import { Button, Label, TextInput } from "flowbite-react";
import { useLogin } from "../../hooks/useLogin";
import { ErrorMessage } from "../shared/ErrorMessage"; // ✅ Import ErrorMessage

export function LoginForm() {
  const { email, setEmail, password, setPassword, error, handleLogin } = useLogin();

  return (
    <form onSubmit={handleLogin} className="flex max-w-md flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Login</h2>

      {/* ✅ Use ErrorMessage component */}
      {error && <ErrorMessage message={error} />}

      <div>
        <Label htmlFor="email1" value="Your email" className="mb-2 block" />
        <TextInput id="email1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username"/>
      </div>

      <div>
        <Label htmlFor="password1" value="Your password" className="mb-2 block" />
        <TextInput id="password1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>

      <Button type="submit">Login</Button>
    </form>
  );
}
