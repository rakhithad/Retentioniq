import { Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/Login";
import EmployeeDataForm from "./components/EmployeeDataForm";
import HRDashboard from "./components/HRDashboard";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/form" element={<EmployeeDataForm />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
      </Routes>
    </div>
  );
}

export default App;