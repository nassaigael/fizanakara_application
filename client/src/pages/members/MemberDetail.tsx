import React from 'react';
import { useParams } from 'react-router-dom';

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Member Detail</h1>
      <p className="text-gray-600 mt-2">Member ID: {id}</p>
    </div>
  );
};

export default MemberDetail;
