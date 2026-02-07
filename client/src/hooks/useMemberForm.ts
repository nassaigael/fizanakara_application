// hooks/useMemberForm.ts
import { useState, useCallback, useEffect } from 'react';
import type { PersonDto, MemberStatus, Gender } from '../lib/types/models/person.type';

interface UseMemberFormProps {
  onSubmitSuccess?: () => void;
  memberToEdit?: any;
}

export const useMemberForm = ({ onSubmitSuccess, memberToEdit }: UseMemberFormProps) => {
  const [formData, setFormData] = useState<PersonDto>({
    firstName: '',
    lastName: '',
    birthDate: new Date().toISOString().split('T')[0],
    gender: 'MALE' as Gender,
    imageUrl: '',
    phoneNumber: '',
    status: 'PENDING' as MemberStatus,
    districtId: 0,
    tributeId: 0,
    parentId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire avec les données du membre à éditer
  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        firstName: memberToEdit.firstName || '',
        lastName: memberToEdit.lastName || '',
        birthDate: memberToEdit.birthDate || new Date().toISOString().split('T')[0],
        gender: memberToEdit.gender || 'MALE',
        imageUrl: memberToEdit.imageUrl || '',
        phoneNumber: memberToEdit.phoneNumber || '',
        status: memberToEdit.status || 'PENDING',
        districtId: memberToEdit.districtId || 0,
        tributeId: memberToEdit.tributeId || 0,
        parentId: memberToEdit.parentId || ''
      });
    } else {
      // Réinitialiser pour une nouvelle création
      setFormData({
        firstName: '',
        lastName: '',
        birthDate: new Date().toISOString().split('T')[0],
        gender: 'MALE' as Gender,
        imageUrl: '',
        phoneNumber: '',
        status: 'PENDING' as MemberStatus,
        districtId: 0,
        tributeId: 0,
        parentId: ''
      });
    }
  }, [memberToEdit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La date de naissance est requise';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis';
    }

    if (!formData.districtId) {
      newErrors.districtId = 'Le district est requis';
    }

    if (!formData.tributeId) {
      newErrors.tributeId = 'La tribu est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Ici, vous appellerez le service approprié
      // Cette fonction sera implémentée par le parent
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Gérer les erreurs du serveur
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          _form: error.message || 'Une erreur est survenue lors de la soumission' 
        });
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmitSuccess]);

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    loading,
    errors,
    setErrors
  };
};