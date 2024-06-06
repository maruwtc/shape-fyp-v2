import {
  Box,
  Button,
  Wrap,
} from "@chakra-ui/react";
import { fetchTest, fetchJavaPath, fetchIP } from "@/app/api/fetchdata";
import { infoTable } from "@/app/components/info";
import Footer from "@/lib/layout/Footer";

const HomePage = async () => {
  const { javaPath, error } = await fetchJavaPath();
  const { intIP, extIP, error: ipError } = await fetchIP();
  const consolelog = { consolelog: 'Waiting...' };
  return (
    <Box>
      <Box>
        {infoTable(javaPath, error, intIP, extIP, ipError)}
      </Box>
      <Wrap spacing={3} my={4}>
        <Button colorScheme='teal' variant='outline'
          onClick={async () => {
            const { test, error } = await fetchTest();
            console.log(test);
            console.log(error);
          }}
        >
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
      <Footer consolelog={consolelog} />
    </Box >
  );
}

export default HomePage;