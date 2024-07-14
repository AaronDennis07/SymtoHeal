import { Link } from 'react-router-dom';

export const DiseaseCard = ({ disease }) => {
  return (
    <div>
    <Link to={`/disease/${disease.name}`} className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{disease.name}</h5>
      <p className="font-normal text-gray-700">Medications: {disease.medications.length}</p>
    </Link>
    </div>
  );
};


