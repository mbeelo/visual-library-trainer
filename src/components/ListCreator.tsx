import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { CustomListData, TrainingList } from '../types';
import { createCustomList, validateCustomListData } from '../utils';

interface ListCreatorProps {
  show: boolean;
  onCreateList: (list: TrainingList) => void;
  onClose: () => void;
}

export default function ListCreator({ show, onCreateList, onClose }: ListCreatorProps) {
  const [formData, setFormData] = useState<CustomListData>({
    name: '',
    creator: '',
    socialLink: '',
    rawItems: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateCustomListData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const newList = createCustomList(formData);
      onCreateList(newList);

      // Reset form
      setFormData({
        name: '',
        creator: '',
        socialLink: '',
        rawItems: ''
      });
      setErrors([]);
      onClose();
    } catch (error) {
      setErrors(['Failed to create list. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exampleText = `Example format:

Simple list (one item per line):
Tree
Mountain
Car
Person

Or with categories:
Nature:
Tree
Mountain
River

Vehicles:
Car
Bicycle
Airplane`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Create Custom List</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="List name (e.g., 'Character Design Essentials')"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Your name or username"
            value={formData.creator}
            onChange={(e) => setFormData(prev => ({ ...prev, creator: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Your social link (optional)"
            value={formData.socialLink}
            onChange={(e) => setFormData(prev => ({ ...prev, socialLink: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <textarea
            placeholder={exampleText}
            value={formData.rawItems}
            onChange={(e) => setFormData(prev => ({ ...prev, rawItems: e.target.value }))}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <Check size={16} />
                Create List
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}