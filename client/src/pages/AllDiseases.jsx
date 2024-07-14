import { useState, useEffect } from 'react';
import axios from 'axios';
import {DiseaseCard} from '../components/DiseaseCard.jsx';


const AllDiseases = () => {
  const [diseases, setDiseases] = useState([]);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await axios.get('http://localhost:8000/all_diseases');
        setDiseases(response.data);
      } catch (error) {
        console.error('Error fetching diseases:', error);
      }
    };

    fetchDiseases();
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">All Diseases</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map((disease) => (
          <DiseaseCard key={disease.name} disease={disease} />
        ))}
      </div>
    </div>
  );
};

export default AllDiseases;