import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const MedicationDetail = () => {
  const [medication, setMedication] = useState(null);
  const { name } = useParams();

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/find_by_medication/${name}`);
        setMedication(response.data);
      } catch (error) {
        console.error('Error fetching medication:', error);
      }
    };

    fetchMedication();
  }, [name]);

  if (!medication) return <div>Loading...</div>;

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">{medication.medication}</h2>
      <h3 className="text-2xl font-semibold mb-4">Side Effects:</h3>
      <ul className="list-disc list-inside mb-6">
        {medication.side_effects.map((effect, index) => (
          <li key={index} className="mb-2">{effect}</li>
        ))}
      </ul>
      <h3 className="text-2xl font-semibold mb-4">Used for Diseases:</h3>
      <ul className="list-disc list-inside">
        {medication.used_for_diseases.map((disease, index) => (
          <li key={index} className="mb-2">{disease}</li>
        ))}
      </ul>
    </div>
  );
};

