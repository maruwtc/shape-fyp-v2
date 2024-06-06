import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text
} from '@chakra-ui/react';

export const infoTable = (javaPath: any, error: any, intIP: any, extIP: any, ipError: any) => {
    return (
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden'>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Items</Th>
                        <Th>Info</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>Internal IP</Td>
                        <Td>{ipError ? <Text color="red.500">{ipError}</Text> : intIP ? intIP : <Text>Loading...</Text>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td>External IP</Td>
                        <Td>
                            {ipError ? <Text color="red.500">{ipError}</Text> : extIP ? extIP : <Text>Loading...</Text>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td>Java Path</Td>
                        <Td>{error ? <Text color="red.500">{error}</Text> : javaPath ? javaPath : <Text>Loading...</Text>}
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    )
}