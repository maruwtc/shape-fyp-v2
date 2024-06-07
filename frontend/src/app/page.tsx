'use client'
import {
    Box,
    Button,
    Wrap,
    Text,
    Divider,
    Input,
    InputGroup,
    InputRightElement,
    useColorMode
} from "@chakra-ui/react";
import { fetchJavaPath, fetchIP, startJNDI, startNcat, inputCMD } from "@/app/api/fetchdata";
import { useEffect, useRef, useState } from "react";
import "@fontsource/jetbrains-mono";
import { exportReport } from "@/app/components/exportpdf";

const HomePage = () => {
    const { colorMode } = useColorMode();
    const [javaPath, setJavaPath] = useState('');
    const [error, setError] = useState('');
    const [intIP, setIntIP] = useState('');
    const [extIP, setExtIP] = useState('');
    const [ipError, setIpError] = useState('');
    const [consolelog, setConsolelog] = useState('');
    const [targetIP, setTargetIP] = useState('');
    const [command, setCommand] = useState('');
    const consoleBoxRef = useRef(null);

    useEffect(() => {
        fetchJavaPath().then(({ javaPath, error }) => {
            if (javaPath) {
                setJavaPath(javaPath);
                setConsolelog(prevLog => prevLog + (prevLog ? `\nJava Path: ${javaPath}` : `Java Path: ${javaPath}`));
            }
            if (error) {
                setError(error);
            }
        });
        fetchIP().then(({ intIP, extIP, ipError }) => {
            if (intIP) {
                setIntIP(intIP);
                setConsolelog(prevLog => prevLog + (prevLog ? `\nInternal IP: ${intIP}` : `Internal IP: ${intIP}`));
            }
            if (extIP) {
                setExtIP(extIP);
                setConsolelog(prevLog => prevLog + (prevLog ? `\nExternal IP: ${extIP}` : `External IP: ${extIP}`));
            }
            if (ipError) {
                setIpError(ipError);
            }
        });
    }, []);

    useEffect(() => {
        if (consoleBoxRef.current) {
            (consoleBoxRef.current as HTMLDivElement).scrollTop = (consoleBoxRef.current as HTMLDivElement).scrollHeight;
        }
    }, [consolelog]);

    const handleInputButtonClick = async (type: any) => {
        let newConsoleLog = '';
        switch (type) {
            case 'test':
                const testResult = 'Test successful!';
                newConsoleLog += `${testResult}`;
                break;
            case 'javaPath':
                const javaPathResult = await fetchJavaPath();
                if (javaPathResult.javaPath) {
                    newConsoleLog += `Java Path: ${javaPathResult.javaPath}`;
                }
                if (javaPathResult.error) {
                    newConsoleLog += `Error: ${javaPathResult.error}`;
                }
                break;
            case 'intip':
                const intIPResult = await fetchIP();
                if (intIPResult.intIP) {
                    newConsoleLog += `Internal IP: ${intIPResult.intIP}`;
                }
                if (intIPResult.ipError) {
                    newConsoleLog += `Error: ${intIPResult.ipError}`;
                }
                break;
            case 'extip':
                const extIPResult = await fetchIP();
                if (extIPResult.extIP) {
                    newConsoleLog += `External IP: ${extIPResult.extIP}`;
                }
                if (extIPResult.ipError) {
                    newConsoleLog += `Error: ${extIPResult.ipError}`;
                }
                break;
            case 'settargetip':
                const targetIPResult = targetIP;
                if (targetIPResult) {
                    newConsoleLog += `Target IP Address: ${targetIPResult}`;
                } else {
                    newConsoleLog += `Error: Target IP Address is empty`;
                }
                break;
            case 'jndi':
                const jndiResult = await startJNDI();
                if (jndiResult.message) {
                    newConsoleLog += `${jndiResult.message}`;
                }
                if (jndiResult.error) {
                    newConsoleLog += `${jndiResult.error}`;
                }
                break;
            case 'ncat':
                const ncatResult = await startNcat();
                if (ncatResult.message) {
                    newConsoleLog += `${ncatResult.message}`;
                }
                if (ncatResult.error) {
                    newConsoleLog += `${ncatResult.error}`;
                }
                break;
            case 'inputcommand':
                const base64cmd = btoa(command);
                const inputCMDResult = await inputCMD(base64cmd);
                if (inputCMDResult.message) {
                    newConsoleLog += `${inputCMDResult.message}`;
                }
                if (inputCMDResult.error) {
                    newConsoleLog += `${inputCMDResult.error}`;
                }
                break;
            default:
                newConsoleLog += 'Unknown operation';
                break;
        }
        setConsolelog(prevLog => prevLog + (prevLog ? `\n${newConsoleLog}` : newConsoleLog));
    };

    return (
        <Box>
            <Box>
                <InputGroup size='md' my={4}>
                    <Input
                        pr='4.5rem'
                        placeholder='Enter Target IP Address'
                        value={targetIP}
                        onChange={(e) => setTargetIP(e.target.value)}
                    />
                    <InputRightElement width='6rem'>
                        <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => handleInputButtonClick('settargetip')}>
                            Set
                        </Button>
                        <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => setTargetIP('')}>
                            Clear
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <InputGroup size='md' my={4}>
                    <Input
                        pr='4.5rem'
                        placeholder='Enter command'
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                    />
                    <InputRightElement width='6rem'>
                        <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => handleInputButtonClick('inputcommand')}>
                            Go
                        </Button>
                        <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => setCommand('')}>
                            Clear
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <Wrap spacing={3} my={4}>
                    <Button size={'sm'} colorScheme='gray' variant='outline' onClick={() => handleInputButtonClick('test')}>
                        Test
                    </Button>
                    <Button size={'sm'} colorScheme='gray' variant='outline' onClick={() => handleInputButtonClick('javaPath')}>
                        Check Java Path
                    </Button>
                    <Button size={'sm'} colorScheme='gray' variant='outline' onClick={() => handleInputButtonClick('intip')}>
                        Check Internal IP
                    </Button>
                    <Button size={'sm'} colorScheme='gray' variant='outline' onClick={() => handleInputButtonClick('extip')}>
                        Check External IP
                    </Button>
                    <Button size={'sm'} colorScheme='green' variant='outline' onClick={() => handleInputButtonClick('jndi')}>
                        Start JNDI Server
                    </Button>
                    <Button size={'sm'} colorScheme='green' variant='outline' onClick={() => handleInputButtonClick('ncat')}>
                        Start Ncat Server
                    </Button>
                    <Button size={'sm'} colorScheme='purple' variant='outline' onClick={exportReport}>
                        Export Console Log
                    </Button>
                    <Button size={'sm'} colorScheme='gray' variant='outline' onClick={() => setConsolelog('')}>
                        Clear All
                    </Button>
                </Wrap>
            </Box>
            <Box ref={consoleBoxRef} as="footer" width="full" justifyContent="center" borderWidth='1px' borderRadius='lg' overflow='hidden' minW={"100%"} minH={"65vh"} maxH={"65vh"} overflowY={"auto"}>
                <Box position="sticky" top="0" zIndex="sticky" bg={colorMode === "light" ? "white" : "gray.800"} px={4} pt={4}>
                    <Text>Output Console:</Text>
                    <Divider my={2} />
                </Box>
                <Box ref={consoleBoxRef} px={4} pb={4}>
                    {consolelog.split('\n').map((line, index) => (
                        <Text key={index}>
                            {line.split('\\n').map((part, i) => (
                                <Text as="span" key={i} display="block"
                                    _before={{
                                        content: '"$"',
                                        color: 'blue.500',
                                        display: 'inline',
                                        fontFamily: 'JetBrains Mono',
                                        fontWeight: 'bold',
                                        marginRight: '8px',
                                        fontSize: 'sm'
                                    }}
                                >{part}</Text>
                            ))}
                        </Text>
                    ))}
                </Box>
            </Box>
        </Box >
    );
}

export default HomePage;
