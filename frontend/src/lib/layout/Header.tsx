import { Box, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const Header = () => {
    return (
        <Flex as="header" width="full" align="center">
            <Box marginRight="auto">
                <Link href="/">
                    <Heading as='h3' size='lg'>
                        GO-Log4Shell
                    </Heading>
                </Link>
            </Box>
            <Box marginLeft="auto">
                <ThemeToggle />
            </Box>
        </Flex>
    );
};

export default Header;