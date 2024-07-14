import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/disease/${search}`);
    }
  };

  return (
    <div className="container mx-auto mt-10 text-center">

      <p className="text-2xl font-semibold text-gray-900 mb-6">Find information about diseases and medications</p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search for a disease..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
       <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center mt-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
            Search
            </button>
          </div>
      </form>
    </div>
  );
};

export default Home;