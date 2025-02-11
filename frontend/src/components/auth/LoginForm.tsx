import { FormEvent, ChangeEvent } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useLogin } from "../../hooks/useLogin";
import { ErrorMessage } from "../shared/ErrorMessage";

/**
 * Login Form Component with TypeScript Type Safety
 */
export function LoginForm(): JSX.Element {
  const { email, setEmail, password, setPassword, error, loading, handleLogin } = useLogin();

  /**
   * Handle input changes safely
   */
  const handleInputChange =
    (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  /**
   * Explicitly pass event to `handleLogin`
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin(e); // ✅ Pass event explicitly
  };

  return (
    <form
      onSubmit={handleSubmit} // ✅ Explicitly passing the event
      className="flex max-w-md flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-96"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Login</h2>

      {error && <ErrorMessage message={error} />}

      <div>
        <Label htmlFor="email1" value="Your email" className="mb-2 block" />
        <TextInput
          id="email1"
          type="email"
          value={email}
          onChange={handleInputChange(setEmail)}
          required
          autoComplete="username"
        />
      </div>

      <div>
        <Label htmlFor="password1" value="Your password" className="mb-2 block" />
        <TextInput
          id="password1"
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}  
      </Button>
    </form>
  );
}

export default LoginForm;
