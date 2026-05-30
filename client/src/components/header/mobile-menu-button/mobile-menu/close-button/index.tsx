import { JSX } from 'react';
import { X } from 'lucide-react';
import { CloseButtonProps } from './types';

const CloseButton = ({onClose}: CloseButtonProps): JSX.Element => {
  return (
    <button onClick={onClose}>
      <X className='w-7 h-7' />
    </button>
  )
};

export default CloseButton;