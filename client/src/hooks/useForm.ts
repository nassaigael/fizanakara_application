import { useState, useCallback, ChangeEvent } from 'react';
import { ZodSchema } from 'zod';

interface UseFormProps<T> {
    initialValues: T;
    validationSchema?: ZodSchema<T>;
    onSubmit: (values: T) => Promise<void> | void;
}

export const useForm = <T extends Record<string, any>>({
    initialValues,
    validationSchema,
    onSubmit
}: UseFormProps<T>) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleChange = useCallback((
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        
        let processedValue: any = value;
        if (type === 'number' || type === 'range') {
            processedValue = value === '' ? undefined : Number(value);
        } else if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        }

        setValues(prev => ({ ...prev, [name]: processedValue }));

        // Effacer l'erreur du champ modifié
        if (errors[name as keyof T]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof T];
                return newErrors;
            });
        }
    }, [errors]);

    const handleBlur = useCallback((
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        if (validationSchema) {
            try {
                validationSchema.parse(values);
            } catch (error: any) {
                if (error.errors) {
                    const fieldError = error.errors.find(
                        (err: any) => err.path[0] === name
                    );
                    if (fieldError) {
                        setErrors(prev => ({ ...prev, [name]: fieldError.message }));
                    }
                }
            }
        }
    }, [validationSchema, values]);

    const validateForm = useCallback(() => {
        if (!validationSchema) return true;

        try {
            validationSchema.parse(values);
            setErrors({});
            return true;
        } catch (error: any) {
            if (error.errors) {
                const newErrors: Partial<Record<keyof T, string>> = {};
                error.errors.forEach((err: any) => {
                    const field = err.path[0] as keyof T;
                    newErrors[field] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    }, [validationSchema, values]);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Marquer tous les champs comme touchés
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Partial<Record<keyof T, boolean>>);
        setTouched(allTouched);

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(values);
        } catch (error: any) {
            setSubmitError(error?.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSubmit]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setSubmitError(null);
    }, [initialValues]);

    const setFieldValue = useCallback((name: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    const setFieldError = useCallback((name: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        submitError,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,
        isValid: Object.keys(errors).length === 0,
        isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    };
};