import { PersonResponseDto } from "../../lib/types/models/person.type";

export const getFinancials = (member: PersonResponseDto) => {
	return {
		paye: 0,
		reste: 5000
	};
};