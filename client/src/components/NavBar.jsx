import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">SymtoHeal</Link>
        <div>
          <Link to="/diseases" className="text-white mx-2 hover:underline">Diseases</Link>
          <Link to="/" className="text-white mx-2 hover:underline">Home</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;