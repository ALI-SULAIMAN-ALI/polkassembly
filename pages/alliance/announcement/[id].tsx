// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState } from 'src/ui-components/UIStates';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

const proposalType = ProposalType.ANNOUNCEMENT;

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { id } = query;
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

	const { data, error } = await getOnChainPost({
		network,
		postId: id || '',
		proposalType
	});

	return { props: { data, error, network } };
};
interface IAnnouncementPostProps {
	data: IPostResponse;
	error?: string;
	network: string;
}

const AnnouncementPost: FC<IAnnouncementPostProps> = (props) => {
	const { data: post, error, network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

	if (!post) return null;

	if (post)
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Announcement`}
					desc={post.content}
					network={network}
				/>
				<BackToListingView
					postCategory={PostCategory.ANNOUNCEMENT}
					trackName='Announcements'
				/>

				<div className='mt-6'>
					<Post
						post={post}
						proposalType={proposalType}
					/>
				</div>
			</>
		);

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default AnnouncementPost;
