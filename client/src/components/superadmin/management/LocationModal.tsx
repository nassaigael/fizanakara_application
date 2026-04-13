import React from 'react';
import { createPortal } from 'react-dom';
import { AiOutlineClose, AiOutlineEnvironment, AiOutlineFlag } from 'react-icons/ai';
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

    return createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md flex flex-col shadow-2xl overflow-hidden border-4 border-white">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white">
                            {isDistrict ? <AiOutlineEnvironment size={20} /> : <AiOutlineFlag size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase">{title}</h2>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                Ajouter un nouveau {isDistrict ? 'district' : 'tribut'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                    >
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={form.handleSubmit} className="space-y-5">
                        <Input
                            label={placeholder}
                            name="name"
                            value={form.values.name || ''}
                            onChange={form.handleChange}
                            error={form.errors.name}
                            placeholder={placeholder}
                            required
                        />

                        <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                ANNULER
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                isLoading={form.isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                CRÉER
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LocationModal;