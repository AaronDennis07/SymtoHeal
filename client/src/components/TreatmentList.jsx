import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/solid';

const TreatmentList = () => {
  const [treatments, setTreatments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("is_admin") === 'true');

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/treatments/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTreatments(response.data);
      } catch (error) {
        console.error('Error fetching treatments:', error);
      }
    };

    fetchTreatments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/admin/treatments/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTreatments(treatments.filter(treatment => treatment.id !== id));
    } catch (error) {
      console.error('Error deleting treatment:', error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Treatments</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all treatments in the system.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {isAdmin && (
            <Link
              to="/treatments/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Treatment
            </Link>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Condition
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Side Effects
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Allopathic Treatment
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Naturopathy Treatment
                    </th>
                    {isAdmin && (
                      <>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Delete</span>
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {treatments.map((treatment) => (
                    <tr key={treatment.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {treatment.condition}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{treatment.side_effects}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{treatment.allopathic_treatment}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{treatment.naturopathy_treatment}</td>
                      {isAdmin && (
                        <>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link to={`/treatments/${treatment.id}`} className="text-primary-600 hover:text-primary-900">
                              Edit<span className="sr-only">, {treatment.condition}</span>
                            </Link>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleDelete(treatment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete<span className="sr-only">, {treatment.condition}</span>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentList;
