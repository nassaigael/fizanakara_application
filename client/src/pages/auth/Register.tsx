import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlinePhone,
  AiOutlineCalendar,
  AiOutlineSafetyCertificate,
  AiOutlineArrowLeft
} from 'react-icons/ai';
import { useAdmin } from '../../hooks/useAdmin';
import { registerSchema } from '../../lib/validators/admin.validator';
import type { RegisterRequestModel } from '../../lib/types/models/admin.models.types';
import { Gender } from '../../lib/types/enum.types';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Select from '../../components/ui/Select';
import { THEME } from '../../styles/theme';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAdmin } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    msg: '',
    variant: 'danger' as 'danger' | 'success'
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterRequestModel>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: Gender.MALE
    }
  });

  const onSubmit: SubmitHandler<RegisterRequestModel> = async (data: RegisterRequestModel) => {
    setIsLoading(true);
    setAlertConfig({ show: false, msg: '', variant: 'danger' });

    try {
      await registerAdmin.mutateAsync(data);
      setAlertConfig({
        show: true,
        msg: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
        variant: 'success'
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setAlertConfig({
        show: true,
        msg: getErrorMessage(error) || 'Erreur lors de la création du compte',
        variant: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg dark:bg-brand-bg-dark relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        <Link
          to="/login"
          className="inline-flex items-center text-[10px] font-black text-brand-muted hover:text-brand-primary mb-6 transition-all group tracking-[0.2em] uppercase"
        >
          <AiOutlineArrowLeft className="mr-2 group-hover:-translate-x-2 transition-transform" size={16} />
          Retour à la connexion
        </Link>

        <div className="bg-white dark:bg-brand-border-dark rounded-[3rem] border-2 border-brand-border border-b-8 p-8 lg:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-primary rounded-3xl mb-4 shadow-[0_10px_0_0_rgba(0,0,0,0.1)] rotate-3">
              <AiOutlineSafetyCertificate className="text-white text-4xl" />
            </div>
            <h1 className={`${THEME.font.black} text-2xl tracking-tight`}>
              Créer un compte
            </h1>
            <p className="text-[9px] font-black text-brand-muted mt-2 uppercase tracking-[0.2em] opacity-60">
              Administration • Fizanakara
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                placeholder="Jean"
                icon={<AiOutlineUser size={20} />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Nom"
                placeholder="DUPONT"
                icon={<AiOutlineUser size={20} />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="admin@fizanakara.mg"
                icon={<AiOutlineMail size={20} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Téléphone"
                placeholder="034 00 000 00"
                icon={<AiOutlinePhone size={20} />}
                error={errors.phoneNumber?.message}
                {...register('phoneNumber')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date de naissance"
                type="date"
                icon={<AiOutlineCalendar size={20} />}
                error={errors.birthDate?.message}
                {...register('birthDate')}
              />
              <Select
                label="Genre"
                options={[
                  { value: 'MALE', label: 'Homme' },
                  { value: 'FEMALE', label: 'Femme' }
                ]}
                error={errors.gender?.message}
                {...register('gender')}
              />
            </div>

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={<AiOutlineLock size={20} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full py-5 text-[11px] tracking-[0.2em]"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'CRÉATION EN COURS...' : 'CRÉER LE COMPTE'}
            </Button>
          </form>

          <p className="text-center mt-6 text-[9px] font-bold text-brand-muted uppercase tracking-widest">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <Alert
        isOpen={alertConfig.show}
        title={alertConfig.variant === 'success' ? 'Succès' : 'Erreur'}
        message={alertConfig.msg}
        variant={alertConfig.variant}
        onClose={() => setAlertConfig({ ...alertConfig, show: false })}
      />
    </div>
  );
};

export default Register;