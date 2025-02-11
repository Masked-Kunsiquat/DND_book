import { useState } from "react";
import { loginWithEmailPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";

/**
 * Defines the expected structure of the login response.
 */
interface LoginResponse {
  success: boolean;
  message?: string;
}

/**
 * Custom hook for handling user login.
 */
export function useLogin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null); // Reset error
    setLoading(true); // Indicate loading state

    try {
      const response: LoginResponse = await loginWithEmailPassword(email, password);

      if (response?.success) {
        // ✅ Clear sensitive data after successful login
        setEmail("");
        setPassword("");

        navigate("/dashboard"); // Redirect to dashboard
      } else {
        setError(response?.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false); // ✅ Stop loading state after login attempt
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading, // ✅ Expose loading state
    handleLogin,
  };
}
