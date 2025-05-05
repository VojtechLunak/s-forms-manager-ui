import axios from 'axios';
import useMock from './mock.js';
import dotenv from 'dotenv';
import "../config";

dotenv.config();

const viteEnvPrefix = "RECORD_MANAGER_";
const ENV = {
    ...Object.keys(process.env).reduce((acc, key) => {
        //if (key.startsWith(viteEnvPrefix)) {
        //    const strippedKey = key.replace(viteEnvPrefix, "");
        //    acc[strippedKey] = process.env[key];
        acc[key] = process.env[key];
                return acc;
    }, {}),
    ...window.__config__,
};

export const getEnv = (name, defaultValue) => {
    console.log(process.env);
    console.log(ENV);
    const value = ENV[name] || defaultValue;
    if (value !== undefined) {
        return value;
    }
    throw new Error(`Missing environment variable: ${name}`);
};


export const REACT_APP_BACKEND_API_URL = getEnv("REACT_APP_BACKEND_API_URL");
export const BASENAME = getEnv("REACT_APP_BASENAME", "");

const apiUrl = REACT_APP_BACKEND_API_URL || 'http://localhost:8088/';

// Mock backend REST API if the environment is configured to do so
if (process.env.REACT_APP_MOCK_REST_API === "true") {
    useMock(axios);
}

export default axios.create({
    baseURL: apiUrl
});
