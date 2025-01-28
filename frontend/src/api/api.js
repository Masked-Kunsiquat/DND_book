import axios from "axios";


const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Fetch notes for the logged-in user
export const fetchNotes = async (authToken) => {
    const response = await api.get("/collections/notes/records", {
        params: {
            expand: "locations",
        },
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
    return response.data.items; // Return the list of notes
};

export default api;