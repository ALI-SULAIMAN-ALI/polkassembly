// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOffChainPosts } from 'pages/api/v1/listing/off-chain-posts';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { FC, useEffect, useState } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import OffChainPostsContainer from '~src/components/Listing/OffChain/OffChainPostsContainer';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { ErrorState } from '~src/ui-components/UIStates';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { useRouter } from 'next/router';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { setNetwork } from '~src/redux/network';
import { useDispatch } from 'react-redux';
import { useUserDetailsSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { getSubdomain } from '~src/util/getSubdomain';

interface IGrantsProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	let network = getNetworkFromReqHeaders(req.headers);
	const queryNetwork = new URL(req.headers.referer || '').searchParams.get('network');
	if (queryNetwork) {
		network = queryNetwork;
	}
	if (query.network) {
		network = query.network as string;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;

	if (!Object.values(sortValues).includes(sortBy.toString()) || (filterBy && filterBy.length !== 0 && !Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))))) {
		return {
			redirect: {
				destination: `/grants?page=${page}&sortBy=${sortValues.NEWEST}&filterBy=${filterBy}&network=${network}`,
				permanent: false
			}
		};
	}

	const { data, error = '' } = await getOffChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page: Number(page),
		proposalType: OffChainProposalType.GRANTS,
		sortBy: String(sortBy)
	});

	return {
		props: {
			data,
			error,
			network
		}
	};
};

const Grants: FC<IGrantsProps> = (props) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const [openModal, setModalOpen] = useState<boolean>(false);

	const router = useRouter();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window.location.href;
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain].includes(network)) {
			router.push({
				query: {
					network: network
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { id } = useUserDetailsSelector();

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { posts, count } = data;

	const handleClick = () => {
		if (id) {
			router.push('/grant/create');
		} else {
			setModalOpen(true);
		}
	};

	return (
		<>
			<SEOHead
				title='Discussions'
				network={network}
			/>
			<div className='flex w-full flex-col sm:flex-row sm:items-center'>
				<h1 className='dashboard-heading dark:text-blue-dark-hight mb-4 flex-1 sm:mb-0'>Grants Discussion</h1>
				<CustomButton
					text='New Grant post'
					onClick={handleClick}
					height={59}
					width={174}
					variant='primary'
					fontSize='lg'
				/>
			</div>

			{/* Intro and Create Post Button */}
			<div className='mt-8 flex flex-col md:flex-row'>
				<p className='dark:text-blue-dark-hight mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay md:p-8 md:text-base'>
					This is the place to discuss grants for {network}. Anyone can start a new grants discussion.{' '}
					<a
						className='text-pink_primary'
						href='https://github.com/moonbeam-foundation/grants/blob/main/interim/interim_grant_proposal.md'
						target='_blank'
						rel='noreferrer'
					>
						Guidelines of the Interim Grants Program.
					</a>
				</p>
			</div>

			<OffChainPostsContainer
				proposalType={OffChainProposalType.GRANTS}
				posts={posts}
				count={count}
				className='mt-8'
			/>
			<ReferendaLoginPrompts
				modalOpen={openModal}
				setModalOpen={setModalOpen}
				image='/assets/referenda-discussion.png'
				title='Join Polkassembly to Start a New Discussion.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</>
	);
};

export default Grants;
