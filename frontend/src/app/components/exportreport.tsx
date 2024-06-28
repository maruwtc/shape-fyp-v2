import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Box,
    Heading,
    Text,
    Divider
} from "@chakra-ui/react";

export const exportModal = ({ isOpenExport, onCloseExport, state }: any) => {
    return (
        <Modal isOpen={isOpenExport} onClose={onCloseExport} size='3xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Export Report</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box border={'lg'} borderWidth='1px' borderRadius='lg' overflow='hidden' px={4} py={4}>
                        <Heading size="md">System Information</Heading>
                        <Text>Java Path: {state.javaPath}</Text>
                        <Text>Internal IP: {state.intIP}</Text>
                        <Text>External IP: {state.extIP}</Text>
                        <Divider my={4} />
                        <Heading size="md">Console Log</Heading>
                        <Text>{state.consolelog}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onCloseExport}>
                        Close
                    </Button>
                    <Button variant="ghost">Export</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export const report = () => {
    return (
        <>
        </>
    );
}