import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Categories from "./pages/Categories";

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace/> : <Login/>}/>
    <Route path="/register" element={user ? <Navigate to="/dashboard" replace/> : <Register/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/resources" element={<Resources/>}/>
      <Route path="/categories" element={<Categories/>}/>
    </Route>
    <Route path="*" element={<Navigate to={user?"/dashboard":"/login"} replace/>}/>
  </Routes>
}