import { MemberStatus } from "../types/models/common.type";
import { PersonResponseDto } from "../types/models/person.type";

export const MemberHelper = {
	getStatusStyle: (status: MemberStatus) => {
		const styles = {
			STUDENT: "bg-blue-100 text-blue-700 border-blue-200",
			WORKER: "bg-purple-100 text-purple-700 border-purple-200"
		};
		return styles[status] || "bg-gray-100 text-gray-700";
	},
	formatDate: (dateString: string) => {
		if (!dateString) return "---";
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	},

	calculateAge: (birthDate: string) => {
		if (!birthDate) return 0;
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
		return age;
	},

	getFinancials: (member: PersonResponseDto) => {
		const baseFee = member.status === "STUDENT" ? 5000 : 10000;
		const childrenFees = (member.childrenCount || 0) * 5000;

		return {
			totalDue: baseFee + childrenFees,
			paid: member.isActiveMember ? (baseFee + childrenFees) : 0,
			remaining: member.isActiveMember ? 0 : (baseFee + childrenFees)
		};
	}
};