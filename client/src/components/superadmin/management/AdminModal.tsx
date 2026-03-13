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
            <div className="bg-white rounded-3xl w-full max-w-2xl border-2 border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-brand-primary to-orange-500 p-8 text-white relative">
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
                            <h2 className="text-2xl font-black uppercase">New Administrator</h2>
                            <p className="text-white/80 text-sm mt-1">Fill in all required fields</p>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <form onSubmit={form.handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                name="firstName"
                                value={form.values.firstName || ''}
                                onChange={form.handleChange}
                                error={form.errors.firstName}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                value={form.values.lastName || ''}
                                onChange={form.handleChange}
                                error={form.errors.lastName}
                                required
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
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={form.values.password || ''}
                            onChange={form.handleChange}
                            error={form.errors.password}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Date of Birth"
                                name="birthDate"
                                type="date"
                                value={form.values.birthDate || ''}
                                onChange={form.handleChange}
                                error={form.errors.birthDate}
                                required
                            />
                            <Select
                                label="Gender"
                                name="gender"
                                value={form.values.gender || 'MALE'}
                                onChange={form.handleChange}
                                options={[
                                    { value: 'MALE', label: 'Male' },
                                    { value: 'FEMALE', label: 'Female' }
                                ]}
                                required
                            />
                        </div>

                        <Input
                            label="Phone Number"
                            name="phoneNumber"
                            value={form.values.phoneNumber || ''}
                            onChange={form.handleChange}
                            error={form.errors.phoneNumber}
                            required
                        />

                        <div className="space-y-2">
                            <Input
                                label="GitHub Image Name"
                                name="imageUrl"
                                value={form.values.imageUrl || ''}
                                onChange={form.handleChange}
                                error={form.errors.imageUrl}
                                placeholder="ex: john_doe.jpg"
                                required
                            />
                            <p className="text-xs text-brand-muted">
                                📸 The image must be stored on GitHub in the /admin folder 
                                (e.g. https://raw.githubusercontent.com/mekill404/image_membre_fizankara/main/admin/image_name.jpg)
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4 border-t-2 border-brand-border">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                isLoading={form.isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <AiOutlinePlus size={18} />
                                Create Administrator
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminModal;
