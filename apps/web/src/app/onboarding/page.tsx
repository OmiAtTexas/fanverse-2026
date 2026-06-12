'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const TEAMS = ['Brazil', 'Argentina', 'France', 'England', 'Germany', 'Spain', 'Portugal', 'Netherlands', 'Italy', 'Mexico', 'USA', 'Canada', 'Japan', 'South Korea', 'Morocco', 'Senegal', 'Australia', 'Belgium', 'Croatia', 'Uruguay'];

const COUNTRIES = ['USA', 'Brazil', 'Argentina', 'Mexico', 'England', 'France', 'Germany', 'Spain', 'Portugal', 'Italy', 'Netherlands', 'Japan', 'South Korea', 'Australia', 'Canada', 'Morocco', 'Senegal', 'India', 'China', 'Nigeria', 'South Africa', 'Saudi Arabia', 'UAE', 'Turkey', 'Poland', 'Colombia', 'Chile', 'Ecuador', 'Peru', 'Bolivia'];

const INTERESTS = ['Food & Drink', 'Nightlife', 'Culture', 'Photography', 'Tactics', 'Fan Zones', 'Stadium Tours', 'Local Transport', 'Budget Travel', 'Luxury Travel'];

const CITIES = ['Dallas', 'New York', 'Los Angeles', 'Miami', 'Houston', 'Atlanta', 'Boston', 'Philadelphia', 'Kansas City', 'Seattle', 'San Francisco', 'Mexico City', 'Guadalajara', 'Monterrey', 'Toronto', 'Vancouver'];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nationality: '',
    supportedTeam: '',
    bio: '',
    interests: [] as string[],
    hostCities: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
    }));
  };

  const toggleCity = (c: string) => {
    setForm(f => ({
      ...f,
      hostCities: f.hostCities.includes(c) ? f.hostCities.filter(x => x !== c) : [...f.hostCities, c],
    }));
  };

  const finish = async () => {
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
      body: JSON.stringify(form),
    });
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 flex flex-col">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[1,2,3,4].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-yellow-500' : 'bg-gray-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-black text-yellow-500 mb-2">Welcome to FanVerse! 🌍</h1>
          <p className="text-gray-400 mb-8">Let's set up your fan profile so you can connect with the right people.</p>
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Your Country</label>
              <select value={form.nationality} onChange={e => setForm(f => ({...f, nationality: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-600">
                <option value="">Select your country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Team You Support</label>
              <select value={form.supportedTeam} onChange={e => setForm(f => ({...f, supportedTeam: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-600">
                <option value="">Select your team</option>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Bio (optional)</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell other fans about yourself..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-600 h-24 resize-none" maxLength={150} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-black text-yellow-500 mb-2">Your Interests 🎯</h1>
          <p className="text-gray-400 mb-6">Select what you're into — we'll match you with similar fans.</p>
          <div className="flex flex-wrap gap-2 flex-1">
            {INTERESTS.map(i => (
              <button key={i} onClick={() => toggleInterest(i)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${form.interests.includes(i) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-300 border-gray-700'}`}>
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-black text-yellow-500 mb-2">Host Cities 📍</h1>
          <p className="text-gray-400 mb-6">Which cities are you visiting for the World Cup?</p>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {CITIES.map(c => (
              <button key={c} onClick={() => toggleCity(c)} className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${form.hostCities.includes(c) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-300 border-gray-700'}`}>
                📍 {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-6xl mb-6">🏆</p>
          <h1 className="text-3xl font-black text-yellow-500 mb-3">You're all set!</h1>
          <p className="text-gray-400 mb-4">Your profile is ready. Start connecting with fans from around the world!</p>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full text-left space-y-2">
            <p className="text-sm"><span className="text-gray-500">Country:</span> <span className="text-white font-bold">{form.nationality}</span></p>
            <p className="text-sm"><span className="text-gray-500">Team:</span> <span className="text-white font-bold">{form.supportedTeam}</span></p>
            <p className="text-sm"><span className="text-gray-500">Cities:</span> <span className="text-white font-bold">{form.hostCities.join(', ') || 'None selected'}</span></p>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 bg-gray-900 border border-gray-700 text-white py-4 rounded-2xl font-bold">
            Back
          </button>
        )}
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} className="flex-1 bg-yellow-500 text-black py-4 rounded-2xl font-bold text-lg">
            Continue →
          </button>
        ) : (
          <button onClick={finish} disabled={loading} className="flex-1 bg-yellow-500 text-black py-4 rounded-2xl font-bold text-lg disabled:opacity-50">
            {loading ? 'Setting up...' : "Let's Go! 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}
