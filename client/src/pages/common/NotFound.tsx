import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineFileUnknown, AiOutlineArrowLeft } from 'react-icons/ai';
import Button from '../../components/ui/Button';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-primary to-orange-600 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[3rem] border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black p-8 text-center">
                        <div className="w-24 h-24 bg-brand-primary/20 rounded-3xl border-4 border-brand-primary flex items-center justify-center mx-auto mb-4">
                            <AiOutlineFileUnknown size={48} className="text-brand-primary" />
                        </div>
                        <h1 className="text-6xl font-black text-white mb-2">404</h1>
                        <p className="text-xl font-black text-brand-primary">Page non trouvée</p>
                    </div>

                    <div className="p-8 text-center">
                        <p className="text-gray-600 font-bold mb-8">
                            La page que vous recherchez n'existe pas ou a été déplacée.
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

export default NotFound;