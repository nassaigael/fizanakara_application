import React, { useState, useEffect } from "react";
import {
    AiOutlineMail,
    AiOutlineLock,
    AiOutlineUser,
    AiOutlineCheckCircle,
    AiOutlineBgColors,
    AiOutlineCheck,
    AiOutlineCamera
} from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import {AuthService} from "../services/auth.service";
import { applyThemeToDOM } from "../lib/helper/themeHelper";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";

const Profile: React.FC = () => {
    const { user, isSuperAdmin, refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });

    const [passwords, setPasswords] = useState({ new: "", confirm: "" });
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("app-theme-color") || "#E51A1A");

    const themes = [
        { name: "Rouge", color: "#E51A1A" },
        { name: "Vert", color: "#10B981" },
        { name: "Bleu", color: "#3B82F6" },
        { name: "Violet", color: "#8B5CF6" },
        { name: "Orange", color: "#F59E0B" }
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || ""
            });
        }
    }, [user]);

    const handleUpdateTheme = (color: string) => {
        setCurrentTheme(color);
        applyThemeToDOM(color);
        toast.success("Thème mis à jour !");
    };

    const handleUpdateInfo = async () => {
        try {
            const updateData: any = { ...formData };
            if (passwords.new) {
                if (passwords.new !== passwords.confirm) {
                    return toast.error("Les mots de passe ne correspondent pas");
                }
                updateData.password = passwords.new;
            }

            // On attend la réponse de type AdminResponseModel
            const response = await AuthService.updateMe(updateData);

            if (response && response.id) {
                toast.success("Profil mis à jour !");
                setPasswords({ new: "", confirm: "" });
                if (refreshUser) refreshUser();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erreur de mise à jour");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className={`bg-white dark:bg-brand-border-dark p-8 rounded-[3rem] border-2 border-brand-border border-b-8 flex flex-col md:flex-row items-center gap-8 shadow-xl animate-in fade-in duration-500`}>
                <div className="relative group">
                    <div className="w-28 h-28 rounded-4xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border-2 border-brand-border overflow-hidden shadow-inner transform group-hover:rotate-3 transition-transform">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <AiOutlineUser size={48} />
                        )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-white border-2 border-brand-border rounded-2xl text-brand-text hover:text-brand-primary transition-all shadow-lg active:scale-90">
                        <AiOutlineCamera size={20} />
                    </button>
                </div>
                
                <div className="text-center md:text-left">
                    <h1 className={`${THEME.font.black} text-3xl tracking-tighter uppercase`}>
                        {formData.firstName} {formData.lastName}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                        <span className="bg-brand-primary text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-b-2 border-black/20">
                            {isSuperAdmin ? 'Super Administrateur' : 'Administrateur'}
                        </span>
                        <AiOutlineCheckCircle className="text-green-500" size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLONNE GAUCHE : INFOS & SÉCURITÉ */}
                <div className="lg:col-span-2 space-y-8">
                    {/* INFOS COMPTE */}
                    <section className="bg-white dark:bg-brand-border-dark p-8 rounded-[2.5rem] border-2 border-brand-border border-b-8 shadow-sm">
                        <h2 className={`${THEME.font.black} text-sm mb-8 flex items-center gap-3 text-brand-muted`}>
                            <AiOutlineUser className="text-brand-primary" size={20} /> COMPTE
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Prénom"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <Input
                                label="Nom"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="Email professionnel"
                                    icon={<AiOutlineMail size={20} />}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SÉCURITÉ */}
                    <section className="bg-white dark:bg-brand-border-dark p-8 rounded-[2.5rem] border-2 border-brand-border border-b-8 shadow-sm">
                        <h2 className={`${THEME.font.black} text-sm mb-8 flex items-center gap-3 text-brand-muted`}>
                            <AiOutlineLock className="text-brand-primary" size={20} /> SÉCURITÉ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nouveau mot de passe"
                                type="password"
                                placeholder="Laisser vide"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            />
                            <Input
                                label="Confirmation"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                        </div>
                    </section>

                    <Button className="w-full py-5 text-sm" onClick={handleUpdateInfo}>
                        Sauvegarder les changements
                    </Button>
                </div>

                <div className="space-y-8">
                    <section className="bg-white dark:bg-brand-border-dark p-8 rounded-[2.5rem] border-2 border-brand-border border-b-8 shadow-sm">
                        <h2 className={`${THEME.font.black} text-sm mb-8 flex items-center gap-3 text-brand-muted uppercase`}>
                            <AiOutlineBgColors size={20} className="text-brand-primary" /> Apparence
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {themes.map((t) => (
                                <button
                                    key={t.name}
                                    onClick={() => handleUpdateTheme(t.color)}
                                    className={`
                                        h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative
                                        ${currentTheme === t.color 
                                            ? 'border-brand-text border-b-8 -translate-y-1' 
                                            : 'border-brand-border border-b-4 hover:border-brand-primary hover:-translate-y-0.5'
                                        }
                                    `}
                                    style={{ backgroundColor: t.color }}
                                >
                                    {currentTheme === t.color && (
                                        <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                                            <AiOutlineCheck className="text-brand-text" size={12} />
                                        </div>
                                    )}
                                    <span className="text-[8px] font-black uppercase text-white drop-shadow-md">
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;