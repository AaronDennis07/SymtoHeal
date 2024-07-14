import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const TreatmentForm = () => {
  const [treatment, setTreatment] = useState({
    condition: '',
    side_effects: '',
    allopathic_treatment: '',
    naturopathy_treatment: '',
  });
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    if (id) {
      const fetchTreatment = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/treatments/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setTreatment(response.data);
        } catch (error) {
          console.error('Error fetching treatment:', error);
        }
      };
      fetchTreatment();
    }
  }, [id]);

  const handleChange = (e) => {
    setTreatment({ ...treatment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:8000/admin/treatments/${id}`, treatment, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post('http://localhost:8000/admin/treatments/', treatment, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      navigate('/treatments');
    } catch (error) {
      console.error('Error saving treatment:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{id ? 'Edit Treatment' : 'Add New Treatment'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <input
            type="text"
            name="condition"
            id="condition"
            value={treatment.condition}
            onChange={handleChange}
            required
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="side_effects" className="block text-sm font-medium text-gray-700">
            Side Effects
          </label>
          <textarea
            name="side_effects"
            id="side_effects"
            rows="3"
            value={treatment.side_effects}
            onChange={handleChange}
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          ></textarea>
        </div>
        <div>
          <label htmlFor="allopathic_treatment" className="block text-sm font-medium text-gray-700">
            Allopathic Treatment
          </label>
          <textarea
            name="allopathic_treatment"
            id="allopathic_treatment"
            rows="3"
            value={treatment.allopathic_treatment}
            onChange={handleChange}
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          ></textarea>
        </div>
        <div>
          <label htmlFor="naturopathy_treatment" className="block text-sm font-medium text-gray-700">
            Naturopathy Treatment
          </label>
          <textarea
            name="naturopathy_treatment"
            id="naturopathy_treatment"
            rows="3"
            value={treatment.naturopathy_treatment}
            onChange={handleChange}
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {id ? 'Update Treatment' : 'Add Treatment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentForm;