import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MedicationCard from '../components/MedicationCard';

const DiseaseDetail = () => {
  const [disease, setDisease] = useState(null);
  const { name } = useParams();

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/find_by_disease/${name}`);
        setDisease(response.data);
      } catch (error) {
          try {
            let response = await axios.post(`http://localhost:8000/process_diseases`,{
              diseases:[name]
            });
             response = await axios.get(`http://localhost:8000/find_by_disease/${name}`);
            setDisease(response.data);
          } catch (error) {
            console.log('Something went wrong')
          }    
        console.error('Error fetching disease:', error);
      }
    };

    fetchDisease();
  }, [name]);

  if (!disease) return <div>Loading...</div>;

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">{disease.disease}</h2>
      <h3 className="text-2xl font-semibold mb-4">Medications:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disease.medications.map((medication) => (
          <MedicationCard key={medication.name} medication={medication} />
        ))}
      </div>
    </div>
  );
};

export default DiseaseDetail;