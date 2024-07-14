import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import TreatmentList from './components/TreatmentList';
import TreatmentForm from './components/TreatmentForm';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AllDiseases from './pages/AllDiseases';
import DiseaseDetail from './pages/DiseaseDetail';
import Home from './pages/Home';
import { MedicationDetail } from './pages/MedicationDetail';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};
const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = !!localStorage.getItem('is_admin');
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/treatments"
            element={
              <PrivateRoute>
                <TreatmentList />
              </PrivateRoute>
            }
          />
          <Route
            path="/treatments/new"
            element={
              <AdminRoute>
                <TreatmentForm />
              </AdminRoute>
            }
          />
          <Route
            path="/treatments/:id"
            element={
              <PrivateRoute>
                <TreatmentForm />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/treatments" />} />
          <Route path="/scrape" element={<AdminRoute> <Home /></AdminRoute>} />
          <Route path="/diseases" element={<PrivateRoute> <AllDiseases /> </PrivateRoute>} />
          <Route path="/disease/:name" element={<PrivateRoute><DiseaseDetail /> </PrivateRoute>} />
          <Route path="/medication/:name" element={<PrivateRoute><MedicationDetail /></PrivateRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;