import React from "react";
import pb from "../api/base";

const Dashboard = () => {
    const handleLogout = async () => {
        try {
            // Clear the authentication store
            pb.authStore.clear();

            // Clear localStorage (optional, for extra cleanup)
            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");

            alert("Logged out successfully!");
            window.location.href = "/login";    // Redirect to login page
        } catch (err) {
            console.error("Error logging out:", err);
            alert("Something went wrong while logging out. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to the Dashboard!</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
