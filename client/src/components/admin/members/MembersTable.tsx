import React from 'react';
import { PersonResponse } from '../../../lib/types';
import MembersTableRow from './MembersTableRow';

interface MembersTableProps {
	members: PersonResponse[];
	onEdit: (member: PersonResponse) => void;
	onDelete: (id: string) => void;
	onView: (member: PersonResponse) => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ members, onEdit, onDelete, onView }) => {
	if (members.length === 0) {
		return (
			<div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-8 sm:p-12 text-center">
				<p className="font-black text-gray-400 uppercase text-xs sm:text-sm">Aucun membre trouvé</p>
				<p className="text-[10px] sm:text-xs text-gray-400 mt-1">
					Essayez d'ajuster votre recherche ou vos filtres
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border-2 border-gray-100 bg-white">
			<table className="min-w-full divide-y-2 divide-gray-100">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-4 py-3 text-left text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
							Profil
						</th>
						<th className="px-4 py-3 text-left text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 hidden sm:table-cell">
							Genre
						</th>
						<th className="px-4 py-3 text-left text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 hidden md:table-cell">
							District
						</th>
						<th className="px-4 py-3 text-left text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 hidden md:table-cell">
							Tribu
						</th>
						<th className="px-4 py-3 text-left text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
							Statut
						</th>
						<th className="px-4 py-3 text-left text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 hidden lg:table-cell">
							Enfants
						</th>
						<th className="px-4 py-3 text-right text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{members.map((member) => (
						<MembersTableRow
							key={member.id}
							member={member}
							onEdit={onEdit}
							onDelete={onDelete}
							onView={onView}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default MembersTable;