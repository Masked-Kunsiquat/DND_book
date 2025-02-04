import React, { useEffect, useState } from "react";
import { fetchLocationAncestry } from "../api/locations";
import { Link, useParams } from "react-router-dom";

const Breadcrumbs = () => {
  const { locationId } = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBreadcrumbs = async () => {
      if (!locationId) {
        console.warn("⚠️ Breadcrumbs: locationId is undefined, skipping fetch.");
        setLoading(false);
        return;
      }

      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          console.error("🔑 Breadcrumbs: Missing authentication token.");
          if (isMounted) setError("Authentication required. Please log in.");
          return;
        }

        console.log("🔄 Fetching full ancestry for location:", locationId);
        const ancestry = await fetchLocationAncestry(authToken, locationId, { requestKey: null });

        if (isMounted) {
          setBreadcrumbs(ancestry);
          setError("");
        }
      } catch (err) {
        console.error("❌ Breadcrumbs fetch failed:", err);
        if (isMounted) setError("Failed to load breadcrumbs. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBreadcrumbs();

    return () => {
      isMounted = false;
      console.log("🧹 Breadcrumbs cleanup executed.");
    };
  }, [locationId]);

  if (loading) return <p className="text-gray-600">Loading breadcrumbs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!breadcrumbs.length) return null; // Hide if empty

  return (
    <nav className="flex text-gray-600" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {/* Home Link */}
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <svg
              className="w-3 h-3 me-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
            Home
          </Link>
        </li>

        {/* Breadcrumb Links */}
        {breadcrumbs.map((loc, index) => (
          <li key={loc.id} aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
              </svg>
              {index === breadcrumbs.length - 1 ? (
                // 🎯 Current Page - BOLD & UNCLICKABLE
                <span className="ms-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {loc.name}
                </span>
              ) : (
                // Parent Links - CLICKABLE
                <Link
                  to={`/locations/${loc.id}`}
                  className="ms-1 text-sm font-medium hover:text-blue-600"
                >
                  {loc.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
