import React from 'react';
import { useParams } from 'react-router-dom';

const AdminEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Edit Admin</h1>
      <p className="text-gray-600 mt-2">Admin ID: {id}</p>
    </div>
  );
};

export default AdminEdit;
