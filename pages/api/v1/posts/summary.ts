// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isValidNetwork, isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { fetchContentSummary } from '~src/util/getPostContentAiSummary';

export interface IPostSummaryResponse {
	summary: string;
}

const handler: NextApiHandler<IPostSummaryResponse | MessageType> = async (req, res) => {
	const { postId = null, proposalType } = req.query;
	if (isNaN(Number(postId))) return res.status(400).json({ message: 'Invalid post ID.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });
	const apiKey = String(req.headers['x-ai-summary-api-key']);
	if (apiKey !== process.env.AI_SUMMARY_API_KEY) {
		return res.status(403).json({ message: 'AI Summary API is not valid.' });
	}

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType) || !isProposalTypeValid(strProposalType))
		return res.status(400).json({ message: `The proposal type of the name "${proposalType}" does not exist.` });

	const postRef = postsByTypeRef(network, proposalType as any).doc(String(postId));
	const doc = await postRef.get();
	if (!doc.exists) {
		return res.status(404).json({ message: `Post with id ${postId} not found.` });
	}

	const postData = doc.data();
	if (postData?.summary) {
		return res.status(200).json({ summary: postData?.summary });
	}

	const summary = await fetchContentSummary(postData?.content as string, proposalType as any);
	await postRef.set({ summary }, { merge: true });

	return res.status(200).json({ summary });
};

export default withErrorHandling(handler);
