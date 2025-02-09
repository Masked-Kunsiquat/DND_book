import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmailPassword } from "../api/login";
import AuthInputField from "../components/auth/AuthInputField";
import AuthButton from "../components/auth/AuthButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginWithEmailPassword(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-sm w-full"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Login
        </h1>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <AuthInputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={loading}
        />
        <AuthInputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
        />
        <AuthButton
          type="submit"
          text={loading ? "Logging in..." : "Login"}
          disabled={loading}
        />
      </form>
    </div>
  );
};

export default Login;
