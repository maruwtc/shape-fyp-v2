export const fetchTest = async () => {
    try {
        const response = await fetch('http://localhost:8080/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:8080',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            },
        });
        if (!response.ok) {
            console.error('Failed to fetch data');
        }
        const data = await response.json();
        return { test: JSON.stringify(data.message).replaceAll('"', ''), error: null };
    }
    catch (error: any) {
        return { test: null, error: error.message };
    }
}

export const fetchJavaPath = async () => {
    try {
        const response = await fetch('http://localhost:8080/findjava', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            console.error('Failed to fetch data');
        }
        const data = await response.json();
        return { javaPath: JSON.stringify(data.java).replaceAll('"', ''), error: null };
    }
    catch (error: any) {
        return { javaPath: null, error: error.message };
    }
}

export const fetchIP = async () => {
    try {
        const responseIntIP = await fetch('http://localhost:8080/findip', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!responseIntIP.ok) {
            console.error('Failed to fetch internal IP');
        }
        const intIPData = await responseIntIP.json();
        const responseExtIP = await fetch('http://localhost:8080/findextip', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!responseExtIP.ok) {
            console.error('Failed to fetch external IP');
        }
        const extIPData = await responseExtIP.json();
        return { intIP: JSON.stringify(intIPData.ip).replaceAll('"', ''), extIP: JSON.stringify(extIPData.ip).replaceAll('"', ''), error: null };
    }
    catch (error: any) {
        return { intIP: null, extIP: null, error: error.message };
    }
}