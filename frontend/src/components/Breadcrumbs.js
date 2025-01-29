import React, { useEffect, useState } from "react";
import { fetchLocationWithParents } from "../api/api";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const Breadcrumbs = () => {
  const { locationId } = useParams(); // Get locationId from URL params
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  console.log("Breadcrumbs received locationId:", locationId); // Debug log

  useEffect(() => {
    const loadBreadcrumbs = async () => {
      if (!locationId) {
        console.error("Breadcrumbs: locationId is undefined, skipping fetch.");
        return; // Don't call the API if locationId is missing
      }

      try {
        const authToken = localStorage.getItem("authToken");
        console.log("Fetching breadcrumbs for location:", locationId);
        const locationData = await fetchLocationWithParents(authToken, locationId);
        console.log("Fetched breadcrumb location data:", locationData);
        setBreadcrumbs(locationData.expand?.parent ? [locationData.expand.parent, locationData] : [locationData]);
      } catch (error) {
        console.error("Failed to fetch breadcrumbs:", error);
      }
    };

    loadBreadcrumbs();
  }, [locationId]);

  if (!breadcrumbs.length) {
    return null; // Hide breadcrumbs if empty
  }

  return (
    <nav className="flex text-gray-600">
      {breadcrumbs.map((loc, index) => (
        <React.Fragment key={loc.id}>
          {index > 0 && <span className="mx-2">/</span>}
          <Link to={`/locations/${loc.id}`} className="hover:underline">
            {loc.name}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
