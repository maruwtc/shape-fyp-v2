import { config } from '~/config';
import axios from 'axios';

export const createPDF = async (data: any) => {
    try {
        const response = await axios.post(config.pdf_url, data, {
            headers: {
                'X-API-KEY': config.pdf_api,
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data);
        return { message: JSON.stringify(response.data.download_url).replaceAll('"', ''), error: null };
    }
    catch (error: any) {
        if (error.response) {
            return { message: null, error: error.response.data.error };
        }
        return { message: null, error: error.message };
    }
}