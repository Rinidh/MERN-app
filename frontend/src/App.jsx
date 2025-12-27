import { useState } from "react";
import "./App.css";
import { Input, Box, useColorModeValue } from "@chakra-ui/react";
import { Link, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} minH={"100vh"}>
      <Navbar />
      <Routes>
        <Route
          index
          element={
            <>
              Button page
              <Link to="/inputPage">Go to Input page</Link>
            </>
          }
        />
        <Route
          path="/inputPage"
          element={
            <>
              Input page
              <Input />
              <Link to="/">Go to Link page</Link>
            </>
          }
        />
      </Routes>
    </Box>
  );
}

export default App;
