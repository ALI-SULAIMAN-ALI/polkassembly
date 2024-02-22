// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { useEffect, useState } from 'react';
import Balance from 'src/components/Balance';

import AddressDropdown from './AddressDropdown';
import HelperTooltip from './HelperTooltip';
import { checkIsAddressMultisig } from '~src/components/DelegationDashboard/utils/checkIsAddressMultisig';

interface Props {
	accounts: InjectedAccount[];
	address: string;
	onAccountChange: (address: string) => void;
	title?: string;
	withBalance?: boolean;
	isBalanceUpdated?: boolean;
	onBalanceChange?: (balance: string) => void;
	className?: string;
	isDisabled?: boolean;
	inputClassName?: string;
	isSwitchButton?: boolean;
	setSwitchModalOpen?: (pre: boolean) => void;
	withoutInfo?: boolean;
	linkAddressTextDisabled?: boolean;
	addressTextClassName?: string;
	isTruncateUsername?: boolean;
	theme?: string;
	showProxyDropdown?: boolean;
	isVoting?: boolean;
}

const AccountSelectionForm = ({
	accounts,
	address,
	onAccountChange,
	title,
	withBalance = false,
	onBalanceChange,
	className,
	isBalanceUpdated,
	isDisabled,
	inputClassName = 'rounded-[4px] px-3 py-1',
	isSwitchButton,
	setSwitchModalOpen,
	withoutInfo,
	linkAddressTextDisabled = false,
	addressTextClassName,
	isTruncateUsername = true,
	showProxyDropdown,
	isVoting = false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	theme
}: Props) => {
	const [isSelectedAddressMultisig, setIsSelectedAddressMultisig] = useState(false);
	useEffect(() => {
		setIsSelectedAddressMultisig(false);
		if (address) {
			checkIsAddressMultisig(address).then((isMulti) => setIsSelectedAddressMultisig(isMulti));
		}
	}, [address]);
	return (
		<article className={`flex w-full flex-col ${className}`}>
			<div className='mb-1 ml-[-6px] flex items-center gap-x-2'>
				<h3 className='inner-headings mb-[1px] ml-1.5 dark:text-blue-dark-medium'>{title}</h3>
				{!withoutInfo && (
					<HelperTooltip
						className='-mt-1 dark:text-grey_primary'
						text='You can choose an account from the extension.'
					/>
				)}
				{address && withBalance && (
					<Balance
						address={address}
						onChange={onBalanceChange}
						isBalanceUpdated={isBalanceUpdated}
						isVoting={isVoting}
					/>
				)}
			</div>
			<AddressDropdown
				addressTextClassName={addressTextClassName}
				linkAddressTextDisabled={linkAddressTextDisabled}
				isDisabled={isDisabled}
				accounts={accounts}
				defaultAddress={address}
				onAccountChange={onAccountChange}
				className={`border-solid border-[#D2D8E0] dark:border-separatorDark ${inputClassName} ${showProxyDropdown ? 'bg-[#f6f7f9]' : ''}`}
				isSwitchButton={isSwitchButton}
				setSwitchModalOpen={setSwitchModalOpen}
				isMultisig={isSelectedAddressMultisig}
				isTruncateUsername={isTruncateUsername}
				showProxyDropdown={showProxyDropdown}
			/>
		</article>
	);
};
export default AccountSelectionForm;
