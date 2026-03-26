import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineLock, AiOutlineArrowLeft } from 'react-icons/ai';
import Button from '../../components/ui/Button';

const Unauthorized: React.FC = () => {
    return (
        <div className="min-h-screen bg-linear-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-red-500 p-8 text-center">
                        <div className="w-24 h-24 bg-white/20 rounded-3xl border-4 border-white flex items-center justify-center mx-auto mb-4">
                            <AiOutlineLock size={48} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Accès refusé
                        </h1>
                    </div>

                    <div className="p-8 text-center">
                        <p className="text-gray-600 font-bold mb-2">
                            Vous n'avez pas les permissions nécessaires
                        </p>
                        <p className="text-xs text-gray-400 mb-8">
                            Cette section est réservée aux administrateurs avec les droits appropriés.
                        </p>

                        <Link to="/">
                            <Button variant="primary" className="w-full">
                                <AiOutlineArrowLeft className="mr-2" />
                                RETOUR À L'ACCUEIL
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;