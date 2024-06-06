'use client'
import {
    Box,
    Button,
    Wrap,
    Text,
    Divider
} from "@chakra-ui/react";
import { fetchTest, fetchJavaPath, fetchIP } from "@/app/api/fetchdata";
import { infoTable } from "@/app/components/infotable";
import { useEffect, useState } from "react";

const HomePage = () => {
    const [javaPath, setJavaPath] = useState('');
    const [error, setError] = useState('');
    const [intIP, setIntIP] = useState('');
    const [extIP, setExtIP] = useState('');
    const [ipError, setIpError] = useState('');
    const [consolelog, setConsolelog] = useState('Waiting...');

    useEffect(() => {
        fetchJavaPath().then(({ javaPath, error }) => {
            if (javaPath) {
                setJavaPath(javaPath);
            }
            if (error) {
                setError(error);
            }
        });
        fetchIP().then(({ intIP, extIP, error }) => {
            if (intIP) {
                setIntIP(intIP);
            }
            if (extIP) {
                setExtIP(extIP);
            }
            if (error) {
                setIpError(error);
            }
        });
    }, []);

    const handleTestButtonClick = async () => {
        const { test, error } = await fetchTest();
        if (test) {
            setConsolelog(consolelog + '\n' + test);
        }
        if (error) {
            setConsolelog(consolelog + '\n' + error);
        }
    };

    return (
        <Box>
            <Box>
                {infoTable(javaPath, error, intIP, extIP, ipError)}
            </Box>
            <Wrap spacing={3} my={4}>
                <Button colorScheme='teal' variant='outline' onClick={handleTestButtonClick}>
                    Test
                </Button>
                <Button colorScheme='green' variant='outline'>
                    Start Ncat Server
                </Button>
                <Button colorScheme='red' variant='outline'>
                    Stop Ncat Server
                </Button>
                <Button colorScheme='blue' variant='outline'>
                    Send Payload & Show Result
                </Button>
                <Button colorScheme='purple' variant='outline'>
                    Export Report
                </Button>
                <Button colorScheme='gray' variant='outline'>
                    Clear All
                </Button>
            </Wrap>
            <Box as="footer" width="full" justifyContent="center" borderWidth='1px' borderRadius='lg' overflow='hidden' p={4} minW={"100%"} minH={"45vh"}>
                <Text>Output Console:</Text>
                <Divider my={4} />
                <Text
                    fontFamily={"monospace"}
                    _before={{
                        content: '">"',
                        color: 'green',
                        display: 'inline',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        marginRight: '8px'
                    }}
                >{consolelog}</Text>
            </Box >
        </Box>
    );
}

export default HomePage;
