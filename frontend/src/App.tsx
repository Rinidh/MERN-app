import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { CreatePage } from "./components/CreatePage";
import { HomePage } from "./components/HomePage";

function App(): JSX.Element {
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} minH={"100vh"}>
      <Navbar />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </Box>
  );
}

export default App;
