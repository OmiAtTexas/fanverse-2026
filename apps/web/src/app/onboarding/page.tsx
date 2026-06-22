'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const TEAMS = ['Brazil','Argentina','France','England','Germany','Spain','Portugal','Netherlands','Italy','Mexico','USA','Canada','Japan','South Korea','Morocco','Senegal','Australia','Belgium','Croatia','Uruguay','Ecuador','Cameroon','Ghana','Serbia','Switzerland','Poland','Denmark','Tunisia','Costa Rica','Wales'];
const COUNTRIES = ['USA','Brazil','Argentina','Mexico','England','France','Germany','Spain','Portugal','Italy','Netherlands','Japan','South Korea','Australia','Canada','Morocco','Senegal','India','China','Nigeria','South Africa','Saudi Arabia','UAE','Turkey','Poland','Colombia','Chile','Ecuador','Peru','Bolivia','Pakistan','Bangladesh','Indonesia','Philippines','Vietnam','Thailand','Malaysia','Singapore','New Zealand','Ireland','Scotland','Wales','Belgium','Denmark','Sweden','Norway','Finland','Czech Republic','Austria','Switzerland','Greece','Romania','Hungary','Ukraine','Serbia','Croatia'];
const INTERESTS = ['Food & Drink','Nightlife','Culture','Photography','Tactics','Fan Zones','Stadium Tours','Local Transport','Budget Travel','Luxury Travel','History','Music','Art','Sports Betting','Fantasy Football'];
const CITIES = ['Dallas','New York/New Jersey','Los Angeles','Miami','Atlanta','Houston','Seattle','San Francisco Bay Area','Boston','Philadelphia','Kansas City','Mexico City','Guadalajara','Monterrey','Vancouver','Toronto'];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [form, setForm] = useState({ displayName: '', nationality: '', supportedTeam: '', bio: '', interests: [] as string[], hostCities: [] as string[] });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Photo must be under 5MB'); return; }
    setPhotoError('');
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const finish = async () => {
    if (!photo) { setPhotoError('Please upload a photo with your face'); return; }
    setLoading(true);
    try {
      // Upload photo to Clerk
      if (photoFile) {
        await user?.setProfileImage({ file: photoFile });
      }
      // Save profile data
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify(form),
      });
      router.push('/home');
    } catch (e) {
      setLoading(false);
    }
  };

  const s: React.CSSProperties = { minHeight: '100vh', background: '#0a0a1a', color: 'white', padding: '24px 20px', display: 'flex', flexDirection: 'column' };

  return (
    <div style={s}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {[1,2,3,4,5].map(n => (
          <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= step ? '#e8003d' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Step 1 — Photo */}
      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: '#e8003d', fontWeight: 700, letterSpacing: 3 }}>STEP 1 OF 5</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>Add your photo</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>Upload a clear photo showing your face. This helps other fans recognize and trust you.</p>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 160, height: 160, borderRadius: '50%', border: photo ? '3px solid #e8003d' : '2px dashed rgba(255,255,255,0.2)', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
              {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Tap to upload</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            {photo && <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '8px 20px', borderRadius: 99, fontSize: 13, cursor: 'pointer' }}>Change photo</button>}
            {photoError && <p style={{ color: '#ff4466', fontSize: 13, textAlign: 'center' }}>{photoError}</p>}
          </div>

          <div style={{ background: 'rgba(232,0,61,0.08)', border: '1px solid rgba(232,0,61,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>⚠️ Accounts without a real face photo will be marked as spam and restricted from using the app.</p>
          </div>
        </div>
      )}

      {/* Step 2 — Name + Country + Team */}
      {step === 2 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: '#e8003d', fontWeight: 700, letterSpacing: 3 }}>STEP 2 OF 5</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>Your identity</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>Tell us who you are and who you're rooting for.</p>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'block', marginBottom: 8 }}>YOUR NAME *</label>
              <input value={form.displayName} onChange={e => setForm(f => ({...f, displayName: e.target.value}))} placeholder="Full name" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: 'white', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'block', marginBottom: 8 }}>HOME COUNTRY *</label>
              <select value={form.nationality} onChange={e => setForm(f => ({...f, nationality: e.target.value}))} style={{ width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: form.nationality ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 15, outline: 'none' }}>
                <option value="">Select your country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'block', marginBottom: 8 }}>TEAM YOU SUPPORT *</label>
              <select value={form.supportedTeam} onChange={e => setForm(f => ({...f, supportedTeam: e.target.value}))} style={{ width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: form.supportedTeam ? 'white' : 'rgba(255,255,255,0.3)', fontSize: 15, outline: 'none' }}>
                <option value="">Select your team</option>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'block', marginBottom: 8 }}>BIO (OPTIONAL)</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell other fans about yourself..." maxLength={150} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: 'white', fontSize: 15, outline: 'none', resize: 'none', height: 90, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Interests */}
      {step === 3 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: '#e8003d', fontWeight: 700, letterSpacing: 3 }}>STEP 3 OF 5</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>Your interests</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>We'll match you with fans who share your vibe.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1 }}>
            {INTERESTS.map(i => (
              <button key={i} onClick={() => setForm(f => ({ ...f, interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i] }))} style={{ padding: '10px 18px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: form.interests.includes(i) ? '#e8003d' : 'rgba(255,255,255,0.07)', color: 'white', transition: 'all 0.2s' }}>
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Cities */}
      {step === 4 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: '#e8003d', fontWeight: 700, letterSpacing: 3 }}>STEP 4 OF 5</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>Host cities</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>Which cities are you visiting for the World Cup?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
            {CITIES.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, hostCities: f.hostCities.includes(c) ? f.hostCities.filter(x => x !== c) : [...f.hostCities, c] }))} style={{ padding: '14px 12px', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: form.hostCities.includes(c) ? '#e8003d' : 'rgba(255,255,255,0.07)', color: 'white', transition: 'all 0.2s', textAlign: 'left' }}>
                📍 {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 — Review */}
      {step === 5 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8, fontSize: 11, color: '#e8003d', fontWeight: 700, letterSpacing: 3 }}>STEP 5 OF 5</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, lineHeight: 1.1 }}>You're all set! 🏆</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>Here's your FanVerse profile.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {photo && <img src={photo} alt="" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8003d' }} />}
            <div>
              <p style={{ fontWeight: 900, fontSize: 20 }}>{form.displayName || user?.firstName}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>🌍 {form.nationality} · ⚽ {form.supportedTeam}</p>
              {form.bio && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{form.bio}</p>}
            </div>
          </div>

          {form.interests.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 }}>INTERESTS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.interests.map(i => <span key={i} style={{ background: 'rgba(232,0,61,0.15)', border: '1px solid rgba(232,0,61,0.3)', color: '#ff6680', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{i}</span>)}
              </div>
            </div>
          )}

          {form.hostCities.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 }}>VISITING</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.hostCities.map(c => <span key={c} style={{ background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', color: '#aa88ff', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>📍 {c}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} style={{ flex: '0 0 80px', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>← Back</button>
        )}
        {step < 5 ? (
          <button
            onClick={() => {
              if (step === 1 && !photo) { setPhotoError('Please upload a photo with your face'); return; }
              if (step === 2 && (!form.displayName || !form.nationality || !form.supportedTeam)) { alert('Please fill in your name, country, and team'); return; }
              setStep(s => s + 1);
            }}
            style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #e8003d, #7b2fff)', color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>
            Continue →
          </button>
        ) : (
          <button onClick={finish} disabled={loading} style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #e8003d, #7b2fff)', color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>
            {loading ? 'Setting up your profile...' : "Let's Go! 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}
