
import React, { useState, useCallback } from 'react';
import { PayloadType, ContextType, GeneratorOptions } from './types';
import { generatePayloads } from './services/payloadGenerator';
import Header from './components/Header';
import PayloadCard from './components/PayloadCard';
import { Checkbox } from './components/Checkbox';

const SPECIAL_CHARS = ['"', '>', '<', '/', "'", '=', ';'];

const App: React.FC = () => {
  const [options, setOptions] = useState<GeneratorOptions>({
    payloadType: PayloadType.General,
    contexts: [ContextType.HTML],
    allowedChars: ['>', '<', "'", '"', '/'],
    tags: ['script', 'img', 'svg', 'a', 'iframe'],
    attributes: ['onload', 'onerror', 'onclick', 'onmouseover', 'src', 'href'],
    attackerHost: 'your-attacker-domain.com',
  });
  const [payloads, setPayloads] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsLoading(true);
    setPayloads([]);
    // Simulate generation time for better UX
    setTimeout(() => {
      const generated = generatePayloads(options);
      setPayloads(generated);
      setIsLoading(false);
    }, 500);
  }, [options]);

  const handleContextChange = (context: ContextType) => {
    setOptions(prev => ({
      ...prev,
      contexts: prev.contexts.includes(context)
        ? prev.contexts.filter(c => c !== context)
        : [...prev.contexts, context],
    }));
  };

  const handleAllowedCharChange = (char: string) => {
    setOptions(prev => ({
      ...prev,
      allowedChars: prev.allowedChars.includes(char)
        ? prev.allowedChars.filter(c => c !== char)
        : [...prev.allowedChars, char],
    }));
  };

  const handleArrayInputChange = (field: 'tags' | 'attributes') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const renderOptions = () => {
    if (options.payloadType === PayloadType.General) {
      return (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contexts</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ContextType).map(context => (
                  <Checkbox
                    key={context}
                    id={context}
                    label={context.replace(/_/g, ' ')}
                    checked={options.contexts.includes(context)}
                    onChange={() => handleContextChange(context)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Allowed Special Characters</label>
              <div className="grid grid-cols-4 gap-2">
                {SPECIAL_CHARS.map(char => (
                  <Checkbox
                    key={char}
                    id={`char-${char}`}
                    label={char}
                    checked={options.allowedChars.includes(char)}
                    onChange={() => handleAllowedCharChange(char)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-2">Allowed Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                value={options.tags.join(', ')}
                onChange={handleArrayInputChange('tags')}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="attributes" className="block text-sm font-medium text-gray-400 mb-2">Allowed Attributes (comma-separated)</label>
              <input
                id="attributes"
                type="text"
                value={options.attributes.join(', ')}
                onChange={handleArrayInputChange('attributes')}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      );
    }
    if (options.payloadType === PayloadType.Keylogger || options.payloadType === PayloadType.CookieTheft) {
      return (
        <div>
          <label htmlFor="attackerHost" className="block text-sm font-medium text-gray-400 mb-2">Attacker Host URL</label>
          <input
            id="attackerHost"
            type="text"
            value={options.attackerHost}
            onChange={(e) => setOptions(prev => ({ ...prev, attackerHost: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="attacker.com"
          />
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Configuration Panel */}
          <div className="lg:col-span-1 bg-gray-850 p-6 rounded-lg shadow-lg h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Payload Type</label>
                <div className="flex bg-gray-800 rounded-md p-1">
                  {Object.values(PayloadType).map(type => (
                    <button
                      key={type}
                      onClick={() => setOptions(prev => ({ ...prev, payloadType: type }))}
                      className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                        options.payloadType === type
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {renderOptions()}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : 'Generate Payloads'}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Generated Payloads ({payloads.length})</h2>
            <div className="space-y-4">
              {isLoading ? (
                  <div className="text-center py-10 text-gray-400">Generating creative payloads...</div>
              ) : payloads.length > 0 ? (
                payloads.map((payload, index) => (
                  <PayloadCard key={index} payload={payload} />
                ))
              ) : (
                <div className="text-center py-20 bg-gray-850 rounded-lg shadow-lg">
                    <p className="text-gray-400">Your generated payloads will appear here.</p>
                    <p className="text-gray-500 text-sm mt-2">Configure options on the left and click "Generate".</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
