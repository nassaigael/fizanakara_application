import React from 'react';
import { AiOutlineClose, AiOutlineEnvironment, AiOutlineFlag, AiOutlinePlus } from 'react-icons/ai';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface LocationModalProps {
    form: any;
    title: string;
    placeholder: string;
    isOpen: boolean;
    onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ form, title, placeholder, isOpen, onClose }) => {
    if (!isOpen) return null;

    const isDistrict = title.includes('District');
    const color = isDistrict ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md border-2 border-black shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className={`bg-gradient-to-r ${color} p-8 text-white relative`}>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <AiOutlineClose size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl">
                            {isDistrict ? <AiOutlineEnvironment size={24} /> : <AiOutlineFlag size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase">{title}</h2>
                            <p className="text-white/80 text-sm mt-1">Add a new {isDistrict ? 'geographic zone' : 'traditional entity'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={form.handleSubmit} className="space-y-6">
                        <Input
                            label={placeholder}
                            name="name"
                            value={form.values.name || ''}
                            onChange={form.handleChange}
                            error={form.errors.name}
                            placeholder={placeholder}
                            required
                        />

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
                                Create
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
