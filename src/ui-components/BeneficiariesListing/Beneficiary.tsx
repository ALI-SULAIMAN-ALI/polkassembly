// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { IBeneficiary } from '~src/types';
import Address from '../Address';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { formatedBalance } from '~src/util/formatedBalance';

interface Props {
	className?: string;
	beneficiary: IBeneficiary;
	inPostHeading?: boolean;
	disableBalanceFormatting?: boolean;
}

const Beneficiary = ({ className, beneficiary, disableBalanceFormatting, inPostHeading }: Props) => {
	const { network } = useNetworkSelector();
	console.log(beneficiary);
	return (
		<div className={`${className} flex items-center gap-1`}>
			<Address
				displayInline
				iconSize={20}
				address={
					typeof beneficiary.address === 'string'
						? beneficiary.address
						: (beneficiary.address as any)?.value.length
						? (beneficiary.address as any)?.value
						: ((beneficiary?.address as any)?.value.interior?.value?.id as string) || ''
				}
				inPostHeading={inPostHeading}
			/>
			<span className='text-blue-light-high dark:text-blue-dark-high'>
				({disableBalanceFormatting ? beneficiary.amount.toString() : formatedBalance(beneficiary.amount.toString(), chainProperties[network]?.tokenSymbol, 2)}&nbsp;
				{chainProperties[network]?.tokenSymbol})
			</span>
		</div>
	);
};

export default Beneficiary;
