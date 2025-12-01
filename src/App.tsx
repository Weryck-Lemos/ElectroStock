import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Login from "./pages/Login/Login";
import Registrar from "./pages/Login/Registrar";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/dashboardAdmin" element={<DashboardAdmin/>}/>
      </Routes>
    </BrowserRouter>
  );
}
