import { config as config } from '~/config';
import axios from 'axios';

export const fetchJavaPath = async () => {
    try {
        const response = await axios.get(config.api_server + '/findjava');
        return { javaPath: JSON.stringify(response.data.java).replaceAll('"', ''), error: null };
    } catch (error: any) {
        if (error.response) {
            return { javaPath: null, error: error.response.data.error };
        }
        return { javaPath: null, error: error.message };
    }
}

export const fetchIP = async () => {
    try {
        const responseIntIP = await axios.get(config.api_server + '/findip');
        const responseExtIP = await axios.get(config.api_server + '/findextip');
        return { intIP: JSON.stringify(responseIntIP.data.ip).replaceAll('"', ''), extIP: JSON.stringify(responseExtIP.data.ip).replaceAll('"', ''), ipError: null };
    } catch (error: any) {
        if (error.response) {
            return { intIP: null, extIP: null, ipError: error.response.data.error };
        }
        return { intIP: null, extIP: null, ipError: error.message };
    }
}

export const startJNDI = async () => {
    try {
        const response = await axios.get(config.api_server + '/startjndi');
        return { message: JSON.stringify(response.data.jndi).replaceAll('"', ''), error: null };
    } catch (error: any) {
        if (error.response) {
            return { message: null, error: error.response.data.error };
        }
        return { message: null, error: error.message };
    }
}

export const startNcat = async () => {
    try {
        const response = await axios.get(config.api_server + '/startncat');
        return { message: JSON.stringify(response.data.message).replaceAll('"', ''), error: null };
    } catch (error: any) {
        if (error.response) {
            return { message: null, error: error.response.data.error };
        }
        return { message: null, error: error.message };
    }
}

export const inputCMD = async (command: string) => {
    try {
        const response = await axios.get(config.api_server + '/inputcmd', { params: { command: command } });
        return { message: JSON.stringify(response.data.output).replaceAll('"', ''), error: null };
    } catch (error: any) {
        if (error.response) {
            return { message: null, error: error.response.data.error };
        }
        return { message: null, error: error.message };
    }
}