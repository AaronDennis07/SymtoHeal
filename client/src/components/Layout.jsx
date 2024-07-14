import React from 'react';
import { Link, useLocation, useNavigate ,NavLink} from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterURL = location.pathname == 'register';
  const isLoggedIn = !!localStorage.getItem('token');
  const is_admin = !!localStorage.getItem('is_admin');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1>SymptoHeal</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {isLoggedIn && (
                  <NavLink
                    to="/treatments"
                    className={({ isActive }) =>
                      `border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive ? 'border-gray-300 text-gray-700' : ''
                      }`
                    }
                  >
                    Treatments
                  </NavLink>
                )}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isLoggedIn && (
                  <NavLink
                    to="/diseases"
                    className={({ isActive }) =>
                      `border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive ? 'border-gray-300 text-gray-700' : ''
                      }`
                    }
                  >
                    Diseases
                  </NavLink>
                )}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isLoggedIn && (
                  <NavLink
                    to="/scrape"
                    className={({ isActive }) =>
                      `border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive ? 'border-gray-300 text-gray-700' : ''
                      }`
                    }
                  >
                    Scrape
                  </NavLink>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Logout
                </button>
              ) : isRegisterURL ? (
                <Link
                  to="/login"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Login
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
