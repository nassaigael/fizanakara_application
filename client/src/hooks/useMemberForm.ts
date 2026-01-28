import { useState, useEffect } from 'react';
import { PersonDto, PersonResponseDto } from '../lib/types/models/person.type';
import { PersonService } from '../services/person.services';
import { personSchema } from '../lib/schemas/person.schema';
import toast from 'react-hot-toast';

export const useMemberForm = (onSuccess: () => void, memberToEdit?: PersonResponseDto | null) => {
    const initialState: PersonDto = {
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "MALE",
        imageUrl: "",
        phoneNumber: "",
        status: "STUDENT",
        districtId: 0,
        tributeId: 0,
        parentId: undefined
    };

    const [formData, setFormData] = useState<PersonDto>(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Synchronisation avec le membre à éditer
    useEffect(() => {
        if (memberToEdit) {
            setFormData({
                firstName: memberToEdit.firstName,
                lastName: memberToEdit.lastName,
                birthDate: memberToEdit.birthDate ? String(memberToEdit.birthDate).split('T')[0] : "",
                gender: memberToEdit.gender,
                imageUrl: memberToEdit.imageUrl || "",
                phoneNumber: memberToEdit.phoneNumber,
                status: memberToEdit.status,
                districtId: memberToEdit.districtId,
                tributeId: memberToEdit.tributeId,
                parentId: memberToEdit.parentId || undefined
            });
        } else {
            setFormData(initialState);
        }
    }, [memberToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'districtId' || name === 'tributeId') ? Number(value) : value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        imageUrl: formData.imageUrl.trim() || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=FF4B4B&color=fff`,
        parentId: (formData.parentId && formData.parentId.trim() !== "") ? formData.parentId : undefined 
    };

    const validation = personSchema.safeParse(payload);
    
    if (!validation.success) {
        const formattedErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
            const path = issue.path[0] as string;
            if (path) {
                formattedErrors[path] = issue.message;
            }
        });

        setErrors(formattedErrors);
        toast.error("Veuillez vérifier les informations saisies.");
        return;
    }

    setLoading(true);
    try {
        if (memberToEdit) {
            await PersonService.update(memberToEdit.id, payload as Partial<PersonDto>);
            toast.success("Informations mises à jour !");
        } else {
            await PersonService.create(payload as PersonDto);
            toast.success("Membre ajouté avec succès !");
        }
        onSuccess();
    } catch (error: any) {
        const serverMessage = error.response?.data?.message;
        toast.error(serverMessage || "Le serveur a rencontré un problème.");
    } finally {
        setLoading(false);
    }
};

    return { formData, handleChange, handleSubmit, loading, errors, setFormData };
};