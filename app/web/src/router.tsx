import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Share from "./pages/Share";
import Landing from "./pages/Landing";
import Docs from "./pages/Docs";

// Application routes configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/editor",
    element: <Home />,
  },
  {
    path: "/docs",
    element: <Docs />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/share",
    element: <Share />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
