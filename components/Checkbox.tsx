
import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange }) => {
  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition-colors">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm font-mono text-gray-300">{label}</span>
    </label>
  );
};
