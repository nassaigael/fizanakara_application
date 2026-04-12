import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileAvatar from '../../components/profile/ProfileAvatar';
import ProfileInfoDisplay from '../../components/profile/ProfileInfoDisplay';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import SecuritySection from '../../components/profile/SecuritySection';

const Profile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProfileHeader />
        
        <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-b-8 border-gray-200 p-5 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <ProfileAvatar />
            {isAdmin ? <ProfileEditForm /> : <ProfileInfoDisplay />}
          </div>
        </div>
      
        {isAdmin && <SecuritySection />}
      </div>
    </div>
  );
};

export default Profile;