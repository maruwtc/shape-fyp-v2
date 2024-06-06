export const fetchTest = async () => {
    try {
        const res = await fetch('http://localhost:8080/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        return { test: JSON.stringify(data.message).replaceAll('"', ''), error: null };
    } catch (error: any) {
        return { test: null, error: error.message };
    }
}

export const fetchJavaPath = async () => {
    try {
        const res = await fetch('http://localhost:8080/findjava', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
        });
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        return { javaPath: JSON.stringify(data.java).replaceAll('"', ''), error: null };
    } catch (error: any) {
        return { javaPath: null, error: error.message };
    }
};

export const fetchIP = async () => {
    try {
        const resIntIP = await fetch('http://localhost:8080/findip', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
        });
        if (!resIntIP.ok) {
            throw new Error('Failed to fetch internal IP');
        }
        const intIPData = await resIntIP.json();
        const resExtIP = await fetch('http://localhost:8080/findextip', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors',
        });
        if (!resExtIP.ok) {
            throw new Error('Failed to fetch external IP');
        }
        const extIPData = await resExtIP.json();
        return {
            intIP: JSON.stringify(intIPData.ip).replaceAll('"', ''),
            extIP: JSON.stringify(extIPData.ip).replaceAll('"', ''),
            error: null
        };
    } catch (error: any) {
        return {
            intIP: null,
            extIP: null,
            error: error.message
        };
    }
}
