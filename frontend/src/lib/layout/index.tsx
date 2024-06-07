'use client';

import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import Header from './Header';

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <Box margin="0 auto" maxWidth={1200} transition="0.5s ease-out">
            <Box margin="8">
                <Header />
                <Box as="main" marginY={22} minH={"40vh"} maxH={"80vh"}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;