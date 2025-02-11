import { useState } from "react";
import { loginWithEmailPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Alert } from "flowbite-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Reset error

    const response = await loginWithEmailPassword(email, password);

    if (response.success) {
      navigate("/dashboard"); // Redirect to dashboard
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="flex max-w-md flex-col gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Login</h2>
        {error && <Alert color="failure">{error}</Alert>}

        <div>
          <Label htmlFor="email1" value="Your email" className="mb-2 block" />
          <TextInput id="email1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="password1" value="Your password" className="mb-2 block" />
          <TextInput id="password1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}

export default Login;
