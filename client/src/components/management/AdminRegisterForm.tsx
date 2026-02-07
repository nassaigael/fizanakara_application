import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    AiOutlineUser, AiOutlineMail, AiOutlineLock,
    AiOutlinePhone, AiOutlineCalendar, AiOutlineUserAdd,
    AiOutlineTrademark
} from 'react-icons/ai';
import AuthService from '../../services/auth.service';
// Importation ajustée au nom de l'interface générée
import { RegisterRequestDto } from '../../lib/types/models/admin.type';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Select from '../shared/Select';
import toast from 'react-hot-toast';

const AdminRegisterForm: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * On utilise RegisterRequestDto pour le typage du formulaire.
     * Note: imageUrl est requis par le DTO, mais sera généré dynamiquement à la soumission.
     */
    const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterRequestDto>({
        defaultValues: { 
            gender: 'MALE' 
        }
    });

    const onSubmit = async (data: RegisterRequestDto) => {
        setIsSubmitting(true);
        try {
            // Génération de l'URL de l'avatar avant l'envoi
            const payload: RegisterRequestDto = {
                ...data,
                imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.firstName)}+${encodeURIComponent(data.lastName)}&background=random&size=128`,
            };

            await AuthService.register(payload);
            
            toast.success("ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !");
            reset();
        } catch (error: any) {
            // Gestion d'erreur plus précise selon la structure Spring Boot habituelle
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "ERREUR LORS DE LA CRÉATION";
            toast.error(errorMessage.toUpperCase());
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-brand-border-dark border-2 border-brand-border border-b-8 p-8 md:p-12 rounded-[2.5rem] shadow-xl transition-colors">
            {/* Header du formulaire */}
            <div className="flex items-center gap-5 mb-12">
                <div className="p-4 bg-brand-primary rounded-3xl text-white shadow-lg rotate-3">
                    <AiOutlineUserAdd size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-brand-text uppercase leading-none tracking-tight">
                        Nouvel Admin
                    </h2>
                    <p className="text-[10px] font-bold text-brand-muted uppercase mt-2 tracking-widest opacity-70">
                        Enregistrement des accès sécurisés
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Identité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Prénom" 
                        icon={<AiOutlineUser />} 
                        error={errors.firstName?.message} 
                        placeholder="Ex: Rakoto" 
                        {...register("firstName", { required: "Le prénom est requis" })}
                    />
                    <Input 
                        label="Nom" 
                        icon={<AiOutlineUser />} 
                        error={errors.lastName?.message} 
                        placeholder="Ex: Jean" 
                        {...register("lastName", { required: "Le nom est requis" })} 
                    />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Email Professionnel" 
                        type="email" 
                        icon={<AiOutlineMail />} 
                        error={errors.email?.message}
                        placeholder="admin@fizanakara.mg"
                        {...register("email", {
                            required: "L'email est requis",
                            pattern: { 
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                                message: "Format d'email invalide" 
                            }
                        })}
                    />
                    <Input
                        label="Téléphone"
                        icon={<AiOutlinePhone />}
                        error={errors.phoneNumber?.message}
                        placeholder="034 00 000 00"
                        {...register("phoneNumber", { 
                            required: "Le téléphone est requis",
                            pattern: {
                                value: /^[0-9+\s]+$/,
                                message: "Format de téléphone invalide"
                            }
                        })}
                    />
                </div>

                {/* Profil & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Date de Naissance" 
                        type="date" 
                        icon={<AiOutlineCalendar />} 
                        error={errors.birthDate?.message} 
                        {...register("birthDate", { required: "La date de naissance est requise" })} 
                    />
                    <Select 
                        label="Genre" 
                        icon={<AiOutlineTrademark />} 
                        options={[
                            { value: "MALE", label: "HOMME" }, 
                            { value: "FEMALE", label: "FEMME" }
                        ]} 
                        {...register("gender", { required: "Sélectionnez un genre" })} 
                    />
                </div>

                {/* Sécurité */}
                <Input 
                    label="Mot de passe temporaire" 
                    type="password" 
                    icon={<AiOutlineLock />} 
                    error={errors.password?.message} 
                    placeholder="••••••••"
                    {...register("password", { 
                        required: "Mot de passe requis", 
                        minLength: { value: 8, message: "8 caractères minimum conseillés" } 
                    })}
                />

                <div className="pt-4">
                    <Button 
                        type="submit" 
                        className="w-full py-5 text-[12px] tracking-[0.2em]" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>CRÉATION EN COURS...</span>
                            </div>
                        ) : (
                            "CRÉER LE COMPTE ADMINISTRATEUR"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminRegisterForm;