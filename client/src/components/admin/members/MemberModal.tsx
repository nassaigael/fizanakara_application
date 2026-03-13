import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { Gender, MemberStatus, District, Tribute } from '../../../lib/types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { THEME } from '../../../styles/theme';

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingId: string | null;
    form: any;
    districts: District[];
    tributes: Tribute[];
}

const MemberModal: React.FC<MemberModalProps> = ({
    isOpen,
    onClose,
    editingId,
    form,
    districts,
    tributes
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border-b-8 border-brand-primary">
                <div className="flex justify-between items-center mb-6">
                    <h2 className={THEME.font.h2}>
                        {editingId ? 'EDIT MEMBER' : 'NEW MEMBER'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <AiOutlineClose size={24} />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Last Name" 
                            name="lastName" 
                            value={form.values.lastName} 
                            onChange={form.handleChange} 
                            error={form.errors.lastName} 
                            required 
                        />
                        <Input 
                            label="First Name" 
                            name="firstName" 
                            value={form.values.firstName} 
                            onChange={form.handleChange} 
                            error={form.errors.firstName} 
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Birth Date" 
                            name="birthDate" 
                            type="date" 
                            value={form.values.birthDate} 
                            onChange={form.handleChange} 
                            error={form.errors.birthDate} 
                            required 
                        />
                        <Select 
                            label="Gender"
                            options={[
                                { label: 'Male', value: Gender.MALE }, 
                                { label: 'Female', value: Gender.FEMALE }
                            ]}
                            value={form.values.gender}
                            onChange={(val) => form.setFieldValue('gender', val)}
                        />
                    </div>

                    <Input 
                        label="Phone Number" 
                        name="phoneNumber" 
                        value={form.values.phoneNumber} 
                        onChange={form.handleChange} 
                        error={form.errors.phoneNumber} 
                        required 
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select 
                            label="District"
                            options={districts.map(d => ({ label: d.name, value: d.id! }))}
                            value={form.values.districtId}
                            onChange={(val) => form.setFieldValue('districtId', Number(val))}
                        />
                        <Select 
                            label="Tribute"
                            options={tributes.map(t => ({ label: t.name, value: t.id! }))}
                            value={form.values.tributeId}
                            onChange={(val) => form.setFieldValue('tributeId', Number(val))}
                        />
                    </div>

                    <Select 
                        label="Status"
                        options={[
                            { label: 'Student', value: MemberStatus.STUDENT }, 
                            { label: 'Worker', value: MemberStatus.WORKER }
                        ]}
                        value={form.values.status}
                        onChange={(val) => form.setFieldValue('status', val)}
                    />

                    <div className="pt-4 flex gap-3">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={onClose} 
                            className="flex-1"
                        >
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            isLoading={form.isSubmitting} 
                            className="flex-1"
                        >
                            {editingId ? 'UPDATE' : 'SAVE'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemberModal;
