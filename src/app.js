import { useRoutes } from "hookrouter";
import React from "react";
import NotFound from "./pages/not-found";
import routes from "./routes";

const App = () => useRoutes(routes) || <NotFound />;

export default App;
