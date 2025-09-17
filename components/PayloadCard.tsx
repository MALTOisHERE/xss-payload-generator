
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './icons/Icons';

interface PayloadCardProps {
  payload: string;
}

const PayloadCard: React.FC<PayloadCardProps> = ({ payload }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-md transition-all hover:bg-gray-700/50">
      <code className="text-sm text-yellow-300 break-all mr-4">{payload}</code>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Copy payload"
      >
        {isCopied ? (
          <CheckIcon className="w-5 h-5 text-green-400" />
        ) : (
          <ClipboardIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default PayloadCard;
