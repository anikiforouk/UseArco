import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { searchUniversities } from '../lib/universities';
import { SKILLS } from '../lib/skills';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 2
  const [university, setUniversity] = useState('');
  const [uniQuery, setUniQuery] = useState('');
  const [uniSuggestions, setUniSuggestions] = useState([]);
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [major, setMajor] = useState('');
  const [role, setRole] = useState('student');
  const [graduationYear, setGraduationYear] = useState('');

  // Step 3
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  const validateEmail = (val) => {
    if (!val) return;
    if (!val.toLowerCase().endsWith('.edu')) {
      setEmailError('A .edu university email is required to join useArco.');
    } else {
      setEmailError('');
    }
  };

  const handleUniSearch = (val) => {
    setUniQuery(val);
    setUniversity('');
    const results = searchUniversities(val);
    setUniSuggestions(results);
    setShowUniDropdown(results.length > 0);
  };

  const selectUniversity = (uni) => {
    setUniversity(uni);
    setUniQuery(uni);
    setShowUniDropdown(false);
  };

  const handleSkillInput = (val) => {
    setSkillInput(val);
    if (val.length > 1) {
      const matches = SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !skills.includes(s)).slice(0, 6);
      setSkillSuggestions(matches);
    } else {
      setSkillSuggestions([]);
    }
  };

  const addSkill = (skill) => {
    if (!skills.includes(skill) && skills.length < 10) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const handleSkillKey = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) return setError('All fields are required.');
      if (!email.toLowerCase().endsWith('.edu')) return setError('A valid .edu email is required.');
      if (password.length < 8) return setError('Password must be at least 8 characters.');
      setStep(2);
    } else if (step === 2) {
      if (!university) return setError('Please select your university from the list.');
      if (!major.trim()) return setError('Major is required.');
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, university, major, role, skills, graduationYear: graduationYear ? parseInt(graduationYear) : null })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Registration failed.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const years = [];
  for (let y = 2025; y <= 2032; y++) years.push(y);

  return (
    <>
      <Head><title>Join useArco - Connect, Collaborate, Build</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/logo.png" alt="useArco" className="h-10 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">University students only - .edu email required</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${step >= s ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-amber-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-6 px-1">
            <span className={step >= 1 ? 'text-amber-600 font-medium' : ''}>Account</span>
            <span className={step >= 2 ? 'text-amber-600 font-medium' : ''}>University</span>
            <span className={step >= 3 ? 'text-amber-600 font-medium' : ''}>Skills</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-6">{error}</div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">University email (.edu)</label>
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    onBlur={e => validateEmail(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                      ${emailError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="yourname@university.edu" />
                  {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
                  {email && email.endsWith('.edu') && !emailError && (
                    <p className="text-green-600 text-xs mt-1">Valid university email</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="At least 8 characters" />
                </div>
                <button onClick={nextStep}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors">
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">University or College</label>
                  <input type="text" value={uniQuery} onChange={e => handleUniSearch(e.target.value)}
                    onFocus={() => uniSuggestions.length > 0 && setShowUniDropdown(true)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="Search your university..." />
                  {university && (
                    <div className="absolute right-3 top-9 text-green-500 text-sm">✓</div>
                  )}
                  {showUniDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {uniSuggestions.map(uni => (
                        <button key={uni} onClick={() => selectUniversity(uni)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors">
                          {uni}
                        </button>
                      ))}
                    </div>
                  )}
                  {uniQuery.length > 1 && !university && uniSuggestions.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">No US university found. Try a different spelling.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Major <span className="text-amber-500">*</span></label>
                  <input type="text" value={major} onChange={e => setMajor(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="e.g. Computer Science, Business, Engineering" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['student','mentor'].map(r => (
                      <button key={r} onClick={() => setRole(r)}
                        className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors
                          ${role === r ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}>
                        {r === 'student' ? 'Student / Founder' : 'Mentor / Advisor'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation year <span className="text-gray-400 text-xs">(optional)</span></label>
                  <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                    <option value="">Select year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button onClick={nextStep} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills you bring <span className="text-gray-400 text-xs">(up to 10, optional)</span></label>
                  <p className="text-xs text-gray-400 mb-3">These help project founders find you for the right roles.</p>

                  {/* Selected skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200">
                          {s}
                          <button onClick={() => removeSkill(s)} className="text-amber-400 hover:text-amber-600 leading-none">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input type="text" value={skillInput} onChange={e => handleSkillInput(e.target.value)} onKeyDown={handleSkillKey}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder={skills.length < 10 ? "Type a skill and press Enter..." : "Max 10 skills reached"}
                      disabled={skills.length >= 10} />
                    {skillSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        {skillSuggestions.map(s => (
                          <button key={s} onClick={() => addSkill(s)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                  <p className="font-medium text-gray-700 mb-2">Account summary</p>
                  <p className="text-gray-500"><span className="text-gray-700 font-medium">{name}</span> - {role}</p>
                  <p className="text-gray-500">{email}</p>
                  <p className="text-gray-500">{university}</p>
                  <p className="text-gray-500">{major}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/login" className="text-amber-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
