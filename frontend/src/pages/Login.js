import React, { useState } from "react";
import api from "../api/api";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.post("/collections/users/auth-with-password", {
                identity: email, password
            });

    // Save token and user info
    localStorage.setItem("authToken", response.data.token);
            localStorage.setItem("userId", response.data.record.id);

        // Redirect to the dashboard
        window.location.href = "/dashboard";
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px"}}>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} required 
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} required 
                    />
                </div>
                {error && <p style={{ color:"red" }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;