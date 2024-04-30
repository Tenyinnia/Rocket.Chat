import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import {
	Contextualbar,
	ContextualbarTitle,
	ContextualbarHeader,
	ContextualbarClose,
	ContextualbarScrollableContent,
	ContextualbarDialog,
} from '../../../../client/components/Contextualbar';
import type { PriorityEditFormFields } from './PriorityEditForm';
import PriorityEditFormWithData from './PriorityEditFormWithData';

type PriorityListProps = {
	context: 'edit';
	priorityId: string;
	onSave: (data: PriorityEditFormFields) => Promise<void>;
	onClose: () => void;
};

const PriorityList = ({ priorityId, onClose, onSave }: PriorityListProps): ReactElement | null => {
	const t = useTranslation();

	return (
		<ContextualbarDialog>
			<Contextualbar>
				<ContextualbarHeader>
					<ContextualbarTitle>{t('Edit_Priority')}</ContextualbarTitle>
					<ContextualbarClose onClick={onClose} />
				</ContextualbarHeader>
				<ContextualbarScrollableContent height='100%'>
					<PriorityEditFormWithData priorityId={priorityId} onSave={onSave} onCancel={onClose} />
				</ContextualbarScrollableContent>
			</Contextualbar>
		</ContextualbarDialog>
	);
};

export default PriorityList;
