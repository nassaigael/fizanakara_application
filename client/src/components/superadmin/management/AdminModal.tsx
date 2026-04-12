import React from 'react';
import { AiOutlineClose, AiOutlineUser, AiOutlinePlus } from 'react-icons/ai';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';

interface AdminModalProps {
    form: any;
    isOpen: boolean;
    onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ form, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl border-2 border-brand-border shadow-[0_12px_0_0_#E5E5E5] overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-linear-to-r from-brand-primary to-brand-primary-dark p-6 text-white relative">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <AiOutlineClose size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <AiOutlineUser size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Nouvel administrateur</h2>
                            <p className="text-white/80 text-sm mt-1">Remplissez tous les champs obligatoires</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={form.handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Prénom"
                                name="firstName"
                                value={form.values.firstName || ''}
                                onChange={form.handleChange}
                                error={form.errors.firstName}
                                required
                                className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                            />
                            <Input
                                label="Nom"
                                name="lastName"
                                value={form.values.lastName || ''}
                                onChange={form.handleChange}
                                error={form.errors.lastName}
                                required
                                className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.values.email || ''}
                            onChange={form.handleChange}
                            error={form.errors.email}
                            required
                            className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                        />

                        <Input
                            label="Mot de passe"
                            name="password"
                            type="password"
                            value={form.values.password || ''}
                            onChange={form.handleChange}
                            error={form.errors.password}
                            required
                            className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Date de naissance"
                                name="birthDate"
                                type="date"
                                value={form.values.birthDate || ''}
                                onChange={form.handleChange}
                                error={form.errors.birthDate}
                                required
                                className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                            />
                            <Select
                                label="Genre"
                                name="gender"
                                value={form.values.gender || 'MALE'}
                                onChange={form.handleChange}
                                options={[
                                    { value: 'MALE', label: 'Masculin' },
                                    { value: 'FEMALE', label: 'Féminin' }
                                ]}
                                required
                                className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>

                        <Input
                            label="Numéro de téléphone"
                            name="phoneNumber"
                            value={form.values.phoneNumber || ''}
                            onChange={form.handleChange}
                            error={form.errors.phoneNumber}
                            required
                            className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                        />

                        <div className="space-y-2">
                            <Input
                                label="Nom de l'image GitHub"
                                name="imageUrl"
                                value={form.values.imageUrl || ''}
                                onChange={form.handleChange}
                                error={form.errors.imageUrl}
                                placeholder="ex: john_doe.jpg"
                                required
                                className="border-2 border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary"
                            />
                            <p className="text-xs text-brand-muted">
                                📸 L'image doit être stockée sur GitHub dans le dossier /admin 
                                (ex: https://raw.githubusercontent.com/mekill404/image_membre_fizankara/main/admin/image_name.jpg)
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-brand-border">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={onClose}
                                className="flex-1 py-3"
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                isLoading={form.isSubmitting}
                                className="flex-1 py-3 flex items-center justify-center gap-2"
                            >
                                <AiOutlinePlus size={18} />
                                Créer l'administrateur
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminModal;