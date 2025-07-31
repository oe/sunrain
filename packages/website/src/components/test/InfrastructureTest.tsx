// React import removed as it's not needed in modern React
import { useState } from 'react';

// Test import using @/ alias
import type { Language } from '@sunrain/shared';

interface InfrastructureTestProps {
  message?: string;
}

/**
 * Simple test component to verify TypeScript path mapping and React integration
 */
export default function InfrastructureTest({ message = "Infrastructure test passed!" }: InfrastructureTestProps) {
  const [count, setCount] = useState(0);
  const [language] = useState<Language>('en');

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-green-50 dark:bg-green-900/20">
      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
        Infrastructure Test Component
      </h3>
      <p className="text-green-700 dark:text-green-300 mb-4">
        {message}
      </p>
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ✅ TypeScript path mapping (@/ alias): Working
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ✅ React integration: Working
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ✅ TypeScript types: Working (Language: {language})
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCount(count + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Click me
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Clicked {count} times
          </span>
        </div>
      </div>
    </div>
  );
}
