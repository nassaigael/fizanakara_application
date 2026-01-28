import { z } from "zod";

const calculateAge = (birthDate: string) => {
	const today = new Date();
	const birth = new Date(birthDate);
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
	return age;
};

export const personSchema = z.object({
	firstName: z.string().min(2, "Le prénom est obligatoire"),
	lastName: z.string().min(2, "Le nom est obligatoire"),
	birthDate: z.string().min(1, "La date de naissance est requise"),
	parentId: z.string().nullable().optional(),
	gender: z.enum(["MALE", "FEMALE"]),
	imageUrl: z.string().min(1, "L'image est requise"),
	phoneNumber: z.string().min(10, "Le numéro est obligatoire"),
	status: z.enum(["WORKER", "STUDENT"]),
	districtId: z.number().int().positive("Le District est requis"),
	tributeId: z.number().int().positive("La Tribu est requise"),
});

export const paymentSchema = z.object({
	amountPaid: z.number().positive("Le montant doit être supérieur à 0"),
	contributionId: z.string().uuid("ID de cotisation invalide"),
});