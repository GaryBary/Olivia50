
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Step, ItineraryState, SelectionItem, MegaShow, MegaHotel } from './types';
import { SelectionCard } from './components/SelectionCard';
import { 
  generateBirthdayToast, 
  fetchMegaItineraryData
} from './services/geminiService';

const CUISINES = [
  "Modern Australian",
  "Mexican",
  "Italian",
  "French",
  "Modern Greek",
  "Middle Eastern",
  "Spanish",
  "Contemporary Japanese",
  "Innovative Cantonese"
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1503095396549-807a8bc3667c?auto=format&fit=crop&q=80&w=1200";

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [megaData, setMegaData] = useState<MegaShow[]>([]);
  const [state, setState] = useState<ItineraryState>({
    show: null,
    hotel: null,
    restaurant: null,
  });
  
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [isGeneratingToast, setIsGeneratingToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background Pre-fetch on mount
  useEffect(() => {
    const preFetch = async () => {
      const data = await fetchMegaItineraryData();
      setMegaData(data);
    };
    preFetch();
  }, []);

  const startJourney = useCallback(async () => {
    if (megaData.length > 0) {
      setCurrentStep('show');
    } else {
      setIsLoading(true);
      setLoadingMsg('Personalising your experience.....');
      const data = await fetchMegaItineraryData();
      setMegaData(data);
      setIsLoading(false);
      setCurrentStep('show');
    }
  }, [megaData]);

  const handleBack = useCallback(() => {
    const sequence: Step[] = ['landing', 'show', 'hotel', 'cuisine', 'restaurant', 'summary'];
    const currentIndex = sequence.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(sequence[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const selectShow = (show: MegaShow) => {
    setState(prev => ({ ...prev, show, hotel: null, restaurant: null }));
    setCurrentStep('hotel');
  };

  const selectHotel = (hotel: MegaHotel) => {
    setState(prev => ({ ...prev, hotel, restaurant: null }));
    setCurrentStep('cuisine');
  };

  const selectCuisine = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    setCurrentStep('restaurant');
  };

  const selectRestaurant = (res: SelectionItem) => {
    setState(prev => ({ ...prev, restaurant: res }));
    setCurrentStep('summary');
  };

  const generateToast = async () => {
    if (!state.show || !state.hotel || !state.restaurant) return;
    setIsGeneratingToast(true);
    const msg = await generateBirthdayToast("Olivia", state.show, state.hotel, state.restaurant);
    setToastMessage(msg);
    setIsGeneratingToast(false);
  };

  const availableRestaurants = useMemo(() => {
    if (!state.hotel || !selectedCuisine) return [];
    return state.hotel.restaurants.filter(r => r.cuisine === selectedCuisine);
  }, [state.hotel, selectedCuisine]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#05070a] backdrop-blur-2xl">
       <div className="relative flex items-center justify-center mb-12">
          <div className="absolute flex gap-16 items-center">
             <div className="animate-icon-1 opacity-0 text-[#d4af37]">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19,10H17V7H7V10H5V7A2,2 0 0,1 7,5H17A2,2 0 0,1 19,7V10M19,15H5V13H19V15M19,18H5V16H19V18M19,21H5V19H19V21M17,11V12H7V11H17Z" /></svg>
             </div>
             <div className="animate-icon-2 opacity-0 text-[#d4af37]">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M11,7L9.6,8.4L11.2,10H2V12H11.2L9.6,13.6L11,15L15,11L11,7M20,2H4C2.9,2 2,2.9 2,4V22H22V4C22,2.9 21.1,2 20,2M20,20H4V4H20V20Z" /></svg>
             </div>
             <div className="animate-icon-3 opacity-0 text-[#d4af37]">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M7,2V5H10V14L7,17H5V19H7L8,22H10L11,19H13L14,22H16L17,19H19V17H17L14,14V5H17V2H7M12,14.5L13.5,16H10.5L12,14.5Z" /></svg>
             </div>
          </div>
          <div className="w-32 h-32 border-b-2 border-t-2 border-[#d4af37] rounded-full animate-spin"></div>
       </div>
       <p className="shimmer-text luxury-font text-2xl tracking-[0.2em] text-center px-6">{loadingMsg}</p>
       <p className="text-white/30 text-[10px] uppercase tracking-widest mt-4">CURATING EXCELLENCE FOR THE BIRTHDAY GIRL</p>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
            <div className="relative z-10 max-w-4xl">
              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                Olivia's <span className="gold-text">50th Birthday</span> Experience
              </h1>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Welcome birthday girl to your custom celebratory planning. Curate an evening of elegance with your handsome husband.
              </p>
              <button 
                onClick={startJourney}
                className="gold-gradient px-12 py-5 rounded-full text-black font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(212,175,55,0.3)]"
              >
                Let's Get Started
              </button>
              {megaData.length > 0 && (
                <p className="mt-4 text-[#d4af37] text-xs uppercase tracking-widest animate-pulse">Experience Ready</p>
              )}
            </div>
          </div>
        );

      case 'show':
        return (
          <div className="min-h-screen pt-32 pb-32 px-6 max-w-7xl mx-auto animate-fade-in">
            <header className="mb-12">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm mb-2 block">Step 1</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your <span className="gold-text">Performance</span></h2>
              <p className="text-gray-400 max-w-xl italic">Curating only the most prestigious Melbourne productions for 2026.</p>
            </header>
            <div className="flex overflow-x-auto gap-8 pb-12 snap-x hide-scrollbar scroll-smooth -mx-6 px-6">
              {megaData.map(show => (
                <div key={show.id} className="snap-center">
                  <SelectionCard 
                    item={show} 
                    isSelected={state.show?.id === show.id}
                    onSelect={() => selectShow(show)}
                    variant="horizontal"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="min-h-screen pt-32 pb-32 px-6 max-w-7xl mx-auto animate-fade-in">
            <header className="mb-12">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm mb-2 block">Step 2</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Select Your <span className="gold-text">Sanctuary</span></h2>
              <p className="text-gray-400 max-w-xl italic">Luxury retreats exclusively near {state.show?.venue}.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl">
              {state.show?.hotels.map(hotel => (
                <SelectionCard 
                  key={hotel.id}
                  item={hotel} 
                  isSelected={state.hotel?.id === hotel.id}
                  onSelect={() => selectHotel(hotel)}
                  variant="vertical"
                />
              ))}
            </div>
            <button onClick={handleBack} className="text-white/50 hover:text-white underline">Back to Performance</button>
          </div>
        );

      case 'cuisine':
        return (
          <div className="min-h-screen pt-32 pb-32 px-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center animate-fade-in">
            <header className="mb-12">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm mb-2 block">Step 3</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Your <span className="gold-text">Palate</span></h2>
              <p className="text-gray-400 max-w-xl mx-auto italic">Define the flavor profile for your signature dinner at {state.hotel?.name}.</p>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
              {CUISINES.map(c => (
                <button
                  key={c}
                  onClick={() => selectCuisine(c)}
                  className="px-6 py-6 border border-[#d4af37]/30 hover:border-[#d4af37] text-white hover:bg-[#d4af37] hover:text-black rounded-2xl transition-all luxury-font text-lg flex items-center justify-center text-center leading-tight"
                >
                  {c}
                </button>
              ))}
            </div>
            <button onClick={handleBack} className="mt-12 text-white/50 hover:text-white underline">Back to Sanctuary</button>
          </div>
        );

      case 'restaurant':
        return (
          <div className="min-h-screen pt-32 pb-32 px-6 max-w-7xl mx-auto animate-fade-in">
            <header className="mb-12">
              <span className="text-[#d4af37] uppercase tracking-widest text-sm mb-2 block">Step 4</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">The <span className="gold-text">{selectedCuisine}</span> Collection</h2>
              <p className="text-gray-400 max-w-xl italic">Curated high-end options geographically convenient for your evening.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {availableRestaurants.length > 0 ? availableRestaurants.map(res => (
                <SelectionCard 
                  key={res.id}
                  item={res} 
                  isSelected={state.restaurant?.id === res.id}
                  onSelect={() => selectRestaurant(res)}
                  variant="vertical"
                />
              )) : (
                <div className="col-span-full py-20 text-center">
                   <p className="text-[#d4af37] italic text-xl">Our concierge is currently polishing the final details for this cuisine...</p>
                   <button onClick={handleBack} className="mt-6 text-white underline">Select another cuisine</button>
                </div>
              )}
            </div>
            <button onClick={handleBack} className="text-white/50 hover:text-white underline">Back to Cuisines</button>
          </div>
        );

      case 'summary':
        return (
          <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto animate-fade-in">
            <header className="text-center mb-16">
              <span className="text-[#d4af37] uppercase tracking-[0.4em] text-sm mb-4 block">EXPERIENCE CURATED</span>
              <h2 className="text-5xl font-bold mb-6">The <span className="gold-text">50th Celebration Experience</span></h2>
              <p className="text-gray-400">Now that your preferences are confirmed, Rob will start preparing for your 50th celebration. It's guaranteed to be an unforgettable experience!</p>
            </header>
            <div className="space-y-6 mb-16">
              {[
                { label: 'The Performance', item: state.show, icon: '🎭', detail: state.show?.dates },
                { label: 'The Retreat', item: state.hotel, icon: '🏨', detail: state.hotel?.location },
                { label: 'The Feast', item: state.restaurant, icon: '🍽️', detail: `Signature: ${state.restaurant?.signatureDish}` },
              ].map((row, idx) => (
                <div key={idx} className="midnight-card rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center group overflow-hidden border-[#d4af37]/10">
                   <div className="w-full md:w-1/3 aspect-video overflow-hidden rounded-xl border border-white/5">
                      <img 
                        src={row.item?.image} 
                        alt={row.item?.name} 
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="text-xl">{row.icon}</span>
                        <span className="text-[#d4af37] font-semibold text-xs uppercase tracking-widest">{row.label}</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-2 text-white group-hover:text-[#d4af37] transition-colors">{row.item?.name}</h3>
                      <p className="text-[#d4af37]/60 text-xs uppercase tracking-tighter mb-2">{row.detail}</p>
                      <p className="text-gray-400 text-sm leading-relaxed font-serif italic">{row.item?.description}</p>
                   </div>
                </div>
              ))}
            </div>
            <div className="midnight-card rounded-3xl p-10 text-center border-[#d4af37]/30 shadow-[0_0_80px_rgba(212,175,55,0.1)]">
              <h3 className="text-3xl font-bold mb-6 gold-text">A Special Custom Birthday Message</h3>
              {!toastMessage ? (
                <button 
                  onClick={generateToast}
                  disabled={isGeneratingToast}
                  className="px-8 py-4 border border-[#d4af37] text-[#d4af37] rounded-full hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {isGeneratingToast ? 'Drafting a Message...' : 'Generate Birthday Message'}
                </button>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-xl italic text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto font-serif">"{toastMessage}"</p>
                  <button onClick={() => setToastMessage(null)} className="text-[#d4af37] text-sm hover:underline">Regenerate Message</button>
                </div>
              )}
            </div>
            <div className="mt-16 text-center">
              <button 
                onClick={() => {
                  setCurrentStep('landing');
                  setSelectedCuisine(null);
                  setState({ show: null, hotel: null, restaurant: null });
                }}
                className="px-10 py-4 text-white hover:text-[#d4af37] transition-colors border border-white/10 rounded-full hover:border-[#d4af37]/50"
              >
                Restart Journey
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      {isLoading && <LoadingOverlay />}
      {currentStep !== 'landing' && (
        <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 backdrop-blur-md border-b border-white/5 animate-fade-in">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 onClick={() => setCurrentStep('landing')} className="luxury-font text-2xl font-bold cursor-pointer gold-text tracking-tighter">
              OLIVIA <span className="text-white font-light text-sm ml-1 opacity-50 tracking-widest uppercase">Concierge</span>
            </h1>
            <div className="hidden md:flex gap-4">
              {['show', 'hotel', 'cuisine', 'restaurant', 'summary'].map((step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${currentStep === step ? 'bg-[#d4af37] scale-150 shadow-[0_0_10px_#d4af37]' : 'bg-white/20'}`} />
                  {idx < 4 && <div className="w-8 h-[1px] bg-white/10" />}
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}
      {renderStep()}
    </div>
  );
};

export default App;
