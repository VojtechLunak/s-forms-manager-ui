import axios from 'axios';
import useMock from './mock.js';

const apiUrl = process.env?.REACT_APP_BACKEND_API_URL || 'http://localhost:8088/';

// Mock backend REST API if the environment is configured to do so
if (process.env.REACT_APP_MOCK_REST_API === "true") {
    useMock(axios);
}

export default axios.create({
    baseURL: apiUrl
});
