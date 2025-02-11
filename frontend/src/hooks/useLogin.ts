import { useState } from "react";
import { loginWithEmailPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";

export function useLogin() {
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleLogin,
  };
}
