import { Link } from 'react-router-dom';

const MedicationCard = ({ medication }) => {
  return (
    <Link to={`/medication/${medication.name}`} className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{medication.name}</h5>
      <p className="font-normal text-gray-700">Side Effects: {medication.side_effects.length}</p>
    </Link>
  );
};

export default MedicationCard;