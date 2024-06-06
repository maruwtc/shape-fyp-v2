import { Box, Divider, Text } from '@chakra-ui/react';

const Footer = (consolelog: any) => {
    return (
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
            >Waiting...</Text>
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
            >{JSON.stringify(consolelog.consolelog)}</Text>
        </Box >
    );
};

export default Footer;