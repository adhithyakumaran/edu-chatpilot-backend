const axios = require('axios');

async function testDelete() {
    const API_URL = 'http://localhost:5000/api';

    try {
        // 1. Create a dummy course
        console.log("Creating dummy course...");
        const createRes = await axios.post(`${API_URL}/courses`, {
            title: "Internal Test Course",
            description: "To be deleted",
            instructor: "Tester"
        });
        const courseId = createRes.data.id;
        console.log("Created course:", courseId);

        // 2. Try to delete it
        console.log("Deleting course:", courseId);
        const deleteRes = await axios.delete(`${API_URL}/courses/${courseId}`);
        console.log("Delete result:", deleteRes.data);

    } catch (error) {
        console.error("Test failed:", error.response ? error.response.data : error.message);
    }
}

testDelete();
