import { useState } from "react";
import "./App.css";
import { Button, ButtonGroup, Input } from "@chakra-ui/react";
import { Link, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
