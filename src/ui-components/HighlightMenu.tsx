// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect, useRef } from 'react';
import QuoteIcon from '~assets/icons/quote-icon.svg';
import TwitterIcon from '~assets/icons/twitter.svg';
import { useQuoteCommentContext } from '~src/context';

const HighlightMenu = () => {
	const { setQuotedText } = useQuoteCommentContext();
	const [selectedText, setSelectedText] = useState('');
	const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

	const menuRef = useRef<HTMLDivElement>(null);
	const markdownRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		markdownRef.current = document.getElementById('markdown');
		const markdown = markdownRef.current;

		if (!markdown) return;

		const handleSelection = () => {
			const selection = window.getSelection();
			const text = selection?.toString().trim();

			if (text !== '') {
				const range = selection?.getRangeAt(0);
				const rect = range?.getBoundingClientRect();

				if (rect) {
					setMenuPosition({
						left: rect.left + rect.width / 2 - 40,
						top: rect.top - 180
					});
				}

				text && setSelectedText(text);
			}
		};

		const clearSelection = () => {
			if (selectedText) {
				document.getSelection()?.removeAllRanges();
				setTimeout(() => {
					setSelectedText('');
				}, 250);
			}
		};

		markdown?.addEventListener('pointerup', handleSelection);
		document?.addEventListener('pointerdown', clearSelection);

		return () => {
			markdown?.removeEventListener('pointerup', handleSelection);
			document?.removeEventListener('pointerdown', clearSelection);
		};
	}, [markdownRef, selectedText]);

	const shareSelection = (event: React.MouseEvent) => {
		window.open(`https://twitter.com/intent/tweet?text=${selectedText}`, '_blank');
		event.stopPropagation();
		setSelectedText('');
	};

	const handleQuote = () => {
		setQuotedText(selectedText);
		const commentForm = document.getElementById('comment-form');

		commentForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	return (
		<div
			ref={menuRef}
			className={`fixed z-[999] ${
				selectedText ? 'block' : 'hidden'
			} flex h-16 w-20 flex-col justify-between gap-1 rounded-md bg-[#363636] p-3 text-sm text-white after:absolute after:left-[65%] after:top-[64px] after:border-8 after:border-b-0 after:border-solid after:border-[#363636] after:border-l-transparent after:border-r-transparent after:content-['']`}
			style={{ left: menuPosition.left, top: menuPosition.top - 10 }}
		>
			<div
				className='flex h-4 cursor-pointer items-center justify-between gap-1'
				onClick={handleQuote}
			>
				<QuoteIcon className='w-3' />
				Quote
			</div>
			<div
				className='flex h-4 cursor-pointer items-center justify-between gap-1'
				onClick={shareSelection}
			>
				<TwitterIcon className='w-3 fill-white' />
				Share
			</div>
		</div>
	);
};

export default HighlightMenu;
