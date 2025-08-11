import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Checkbox } from './components/ui/checkbox';
import { Label } from './components/ui/label';

// Types
interface FormData {
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  sex: string;
  smoker: boolean;
  bmi: string;
  outlook: string;
  alcoholConsumption: string;
  country: string;
  includeFitnessDiet: boolean;
  fitnessLevel: string;
  dietRating: string;
}

interface BMIData {
  weightUnit: string;
  weightValue: string;
  heightUnit: string;
  heightValue: string;
}

interface DeathResults {
  deathDate: string;
  lifeExpectancy: string;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  approximateYears: number;
  targetDeathDate: Date | null;
  currentAge: number;
  ageInMonths: number;
  ageInDays: number;
  testDate: string;
  totalDaysLived: number;
  totalWeeksLived: number;
  totalMonthsLived: number;
}

interface CountdownTime {
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  approximateYears: number;
}

type LifeExpectancyByCountry = Record<string, { male: number; female: number }>;

// Constants
const DAYS_IN_MONTH = 30.44;
const DAYS_IN_WEEK = 7;
const DAYS_IN_YEAR = 365.25;
const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = MS_IN_SECOND * 60;
const MS_IN_HOUR = MS_IN_MINUTE * 60;
const MS_IN_DAY = MS_IN_HOUR * 24;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;

const COUNTRY_LIFE_EXPECTANCY: LifeExpectancyByCountry = {
  'Japan': { male: 81.6, female: 87.7 },
  'South Korea': { male: 80.3, female: 86.1 },
  'Switzerland': { male: 81.8, female: 85.6 },
  'Australia': { male: 81.2, female: 85.4 },
  'Spain': { male: 80.9, female: 86.2 },
  'Iceland': { male: 81.3, female: 84.9 },
  'Italy': { male: 81.2, female: 85.6 },
  'Israel': { male: 81.1, female: 84.9 },
  'Sweden': { male: 81.3, female: 84.7 },
  'France': { male: 79.8, female: 85.7 },
  'Norway': { male: 81.0, female: 84.3 },
  'Singapore': { male: 81.4, female: 85.7 },
  'Netherlands': { male: 80.3, female: 83.8 },
  'Canada': { male: 80.2, female: 84.1 },
  'New Zealand': { male: 80.2, female: 83.5 },
  'United Kingdom': { male: 79.8, female: 83.4 },
  'Germany': { male: 78.9, female: 83.6 },
  'United States': { male: 76.4, female: 81.2 },
  'China': { male: 75.0, female: 79.9 }
} as const;

// Initial state values
const INITIAL_FORM_DATA: FormData = {
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  sex: '',
  smoker: false,
  bmi: '',
  outlook: '',
  alcoholConsumption: '',
  country: '',
  includeFitnessDiet: false,
  fitnessLevel: '',
  dietRating: ''
};

const INITIAL_BMI_DATA: BMIData = {
  weightUnit: '',
  weightValue: '',
  heightUnit: '',
  heightValue: ''
};

const INITIAL_DEATH_RESULTS: DeathResults = {
  deathDate: '',
  lifeExpectancy: '',
  daysRemaining: 0,
  hoursRemaining: 0,
  minutesRemaining: 0,
  secondsRemaining: 0,
  approximateYears: 0,
  targetDeathDate: null,
  currentAge: 0,
  ageInMonths: 0,
  ageInDays: 0,
  testDate: '',
  totalDaysLived: 0,
  totalWeeksLived: 0,
  totalMonthsLived: 0
};

const INITIAL_COUNTDOWN_TIME: CountdownTime = {
  daysRemaining: 0,
  hoursRemaining: 0,
  minutesRemaining: 0,
  secondsRemaining: 0,
  approximateYears: 0
};

export default function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [bmiData, setBmiData] = useState<BMIData>(INITIAL_BMI_DATA);
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [deathResults, setDeathResults] = useState<DeathResults>(INITIAL_DEATH_RESULTS);
  const [currentTime, setCurrentTime] = useState<CountdownTime>(INITIAL_COUNTDOWN_TIME);

  // Memoized computed values
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const thisYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => thisYear - i), [thisYear]);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      formData.birthDay !== '' &&
      formData.birthMonth !== '' &&
      formData.birthYear !== '' &&
      formData.sex !== '' &&
      formData.country !== '' &&
      (formData.bmi !== '' || calculatedBMI !== null)
    );
  }, [formData.birthDay, formData.birthMonth, formData.birthYear, formData.sex, formData.country, formData.bmi, calculatedBMI]);

  const calculateBMI = useCallback(() => {
    const weight = parseFloat(bmiData.weightValue);
    const height = parseFloat(bmiData.heightValue);

    if (!weight || !height) return;

    let weightInKg = weight;
    let heightInM = height;

    if (bmiData.weightUnit === 'pounds') {
      weightInKg = weight * 0.453592;
    }

    if (bmiData.heightUnit === 'inches') {
      heightInM = height * 0.0254;
    } else if (bmiData.heightUnit === 'cm') {
      heightInM = height / 100;
    }

    const bmi = weightInKg / (heightInM * heightInM);
    setCalculatedBMI(Math.round(bmi * 10) / 10);
  }, [bmiData.weightValue, bmiData.heightValue, bmiData.weightUnit, bmiData.heightUnit]);

  const handleInstagramShare = useCallback(async () => {
    const shareText = `🔮 Death Clock Results 💀\n\nI will live to be ${deathResults.lifeExpectancy} old!\n\nPredicted death date: ${deathResults.deathDate}\n\nTime remaining: ${currentTime.approximateYears} years\n\n#DeathClock #LifeExpectancy`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Death Clock Results',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copying to clipboard
        fallbackShare(shareText);
      }
    } else {
      // Fallback for desktop browsers
      fallbackShare(shareText);
    }
  }, [deathResults.lifeExpectancy, deathResults.deathDate, currentTime.approximateYears]);

  const fallbackShare = (text: string) => {
    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard! You can now paste it on Instagram.');
      }).catch(() => {
        // Final fallback - show text in alert
        alert('Copy this text to share on Instagram:\n\n' + text);
      });
    } else {
      // Final fallback - show text in alert
      alert('Copy this text to share on Instagram:\n\n' + text);
    }
  };

  // (removed unused generateShareImage to avoid linter warnings)

  const handleRetakeTest = useCallback(() => {
    // Reset all form data
    setFormData(INITIAL_FORM_DATA);
    
    // Reset BMI data
    setBmiData(INITIAL_BMI_DATA);
    
    // Reset calculated BMI
    setCalculatedBMI(null);
    
    // Reset dropdown state
    setOpenDropdown(null);
    
    // Go back to first screen
    setIsSubmitted(false);
    
    // Reset death results
    setDeathResults(INITIAL_DEATH_RESULTS);
    
    // Reset current time
    setCurrentTime(INITIAL_COUNTDOWN_TIME);
  }, []);

  const handleSubmit = () => {
    // Calculate birth date
    const birthDate = new Date(
      parseInt(formData.birthYear),
      parseInt(formData.birthMonth) - 1,
      parseInt(formData.birthDay)
    );
    
    const today = new Date();
    
    // Calculate current age more accurately
    let currentAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      currentAge--;
    }
    
    // Get base life expectancy for country and sex
    let baseLifeExpectancy = 78; // Global average fallback
    const countryData = COUNTRY_LIFE_EXPECTANCY[formData.country];
    if (countryData) {
      baseLifeExpectancy = formData.sex === 'female' ? countryData.female : countryData.male;
    } else {
      // General adjustments if country not in list
      if (formData.sex === 'female') baseLifeExpectancy += 4;
    }
    
    // Age-based adjustments (remaining life expectancy decreases with age)
    const ageAdjustment = currentAge * 0.1; // Slight decrease per year of current age
    baseLifeExpectancy -= ageAdjustment;
    
    // BMI adjustments based on medical research
    if (calculatedBMI) {
      if (calculatedBMI < 16) baseLifeExpectancy -= 8; // Severely underweight
      else if (calculatedBMI < 18.5) baseLifeExpectancy -= 3; // Underweight
      else if (calculatedBMI >= 18.5 && calculatedBMI < 25) baseLifeExpectancy += 2; // Normal
      else if (calculatedBMI >= 25 && calculatedBMI < 30) baseLifeExpectancy -= 2; // Overweight
      else if (calculatedBMI >= 30 && calculatedBMI < 35) baseLifeExpectancy -= 6; // Obese I
      else if (calculatedBMI >= 35 && calculatedBMI < 40) baseLifeExpectancy -= 10; // Obese II
      else if (calculatedBMI >= 40) baseLifeExpectancy -= 15; // Obese III
    }
    
    // Smoking adjustments
    if (formData.smoker) {
      if (formData.sex === 'male') baseLifeExpectancy -= 13.2;
      else baseLifeExpectancy -= 14.5; // Smoking affects women slightly more
    }
    
    // Alcohol consumption adjustments
    switch (formData.alcoholConsumption) {
      case 'never':
        baseLifeExpectancy += 0.5;
        break;
      case 'once-a-month':
        baseLifeExpectancy += 1; // Light drinking can be beneficial
        break;
      case '2-4-times-per-month':
        baseLifeExpectancy += 0.5;
        break;
      case '2-times-a-week':
        baseLifeExpectancy -= 1;
        break;
      case 'daily':
        baseLifeExpectancy -= 5;
        break;
      case 'constantly-blotto':
        baseLifeExpectancy -= 15;
        break;
    }
    
    // Outlook/mental health adjustments
    switch (formData.outlook) {
      case 'optimistic':
        baseLifeExpectancy += 2;
        break;
      case 'pessimistic':
        baseLifeExpectancy -= 3;
        break;
      case 'neutral':
        // No change
        break;
    }
    
    // Fitness level adjustments
    if (formData.includeFitnessDiet) {
      switch (formData.fitnessLevel) {
        case 'ironman':
          baseLifeExpectancy += 8;
          break;
        case 'very-active':
          baseLifeExpectancy += 5;
          break;
        case 'moderately-active':
          baseLifeExpectancy += 3;
          break;
        case 'couch-potato':
          baseLifeExpectancy -= 4;
          break;
      }
      
      // Diet rating adjustments
      switch (formData.dietRating) {
        case 'excellent':
          baseLifeExpectancy += 4;
          break;
        case 'good':
          baseLifeExpectancy += 2;
          break;
        case 'ok':
          baseLifeExpectancy += 0;
          break;
        case 'terrible':
          baseLifeExpectancy -= 3;
          break;
      }
    }
    
    // Add some realistic randomness (±2 years)
    const randomFactor = (Math.random() - 0.5) * 4;
    baseLifeExpectancy += randomFactor;
    
    // Calculate total life expectancy from current age
    const totalLifeExpectancy = currentAge + Math.max(0, baseLifeExpectancy - currentAge);
    
    // Create death date
    const deathDate = new Date(birthDate);
    const totalYears = Math.floor(totalLifeExpectancy);
    const remainingMonths = Math.floor((totalLifeExpectancy - totalYears) * 12);
    const remainingDays = Math.floor(((totalLifeExpectancy - totalYears) * 12 - remainingMonths) * 30.44);
    
    deathDate.setFullYear(birthDate.getFullYear() + totalYears);
    deathDate.setMonth(birthDate.getMonth() + remainingMonths);
    deathDate.setDate(birthDate.getDate() + remainingDays);
    
    // Calculate remaining time
    const timeDiff = deathDate.getTime() - today.getTime();
    const daysRemaining = Math.floor(timeDiff / MS_IN_DAY);
    const hoursRemaining = Math.floor((timeDiff % MS_IN_DAY) / MS_IN_HOUR);
    const minutesRemaining = Math.floor((timeDiff % MS_IN_HOUR) / MS_IN_MINUTE);
    const secondsRemaining = Math.floor((timeDiff % MS_IN_MINUTE) / MS_IN_SECOND);
    const approximateYears = Math.floor(daysRemaining / DAYS_IN_YEAR);
    
    // Format death date
    const formattedDeathDate = `${DAYS_OF_WEEK[deathDate.getDay()]}, ${deathDate.getDate()}${getOrdinalSuffix(deathDate.getDate())} ${MONTHS[deathDate.getMonth()]} ${deathDate.getFullYear()}`;
    
    // Calculate accurate life expectancy display
    const lifeExpectancyYears = Math.floor(totalLifeExpectancy);
    const lifeExpectancyMonths = Math.floor((totalLifeExpectancy - lifeExpectancyYears) * 12);
    const lifeExpectancyDays = Math.floor(((totalLifeExpectancy - lifeExpectancyYears) * 12 - lifeExpectancyMonths) * DAYS_IN_MONTH);
    
    // Calculate detailed age information
    const totalDaysLived = Math.floor((today.getTime() - birthDate.getTime()) / MS_IN_DAY);
    const totalWeeksLived = Math.floor(totalDaysLived / DAYS_IN_WEEK);
    const totalMonthsLived = Math.floor(totalDaysLived / DAYS_IN_MONTH);
    
    // Calculate current age in years, months, and days more accurately
    let ageMonths = 0;
    let ageDays = 0;
    
    // Calculate months since last birthday
    if (monthDiff >= 0) {
      ageMonths = monthDiff;
    } else {
      ageMonths = 12 + monthDiff;
    }
    
    // Calculate days since last month anniversary
    if (dayDiff >= 0) {
      ageDays = dayDiff;
    } else {
      ageMonths = ageMonths > 0 ? ageMonths - 1 : 11;
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
      ageDays = Math.floor((today.getTime() - lastMonth.getTime()) / MS_IN_DAY);
    }
    
    // Format test date
    const testDate = `${DAYS_OF_WEEK[today.getDay()]}, ${today.getDate()}${getOrdinalSuffix(today.getDate())} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;
    
    setDeathResults({
      deathDate: formattedDeathDate,
      lifeExpectancy: `${lifeExpectancyYears} years, ${lifeExpectancyMonths} months and ${lifeExpectancyDays} days`,
      daysRemaining: Math.max(0, daysRemaining),
      hoursRemaining: Math.max(0, hoursRemaining),
      minutesRemaining: Math.max(0, minutesRemaining),
      secondsRemaining: Math.max(0, secondsRemaining),
      approximateYears: Math.max(0, approximateYears),
      targetDeathDate: deathDate,
      currentAge: currentAge,
      ageInMonths: ageMonths,
      ageInDays: ageDays,
      testDate: testDate,
      totalDaysLived: totalDaysLived,
      totalWeeksLived: totalWeeksLived,
      totalMonthsLived: totalMonthsLived
    });

    setCurrentTime({
      daysRemaining: Math.max(0, daysRemaining),
      hoursRemaining: Math.max(0, hoursRemaining),
      minutesRemaining: Math.max(0, minutesRemaining),
      secondsRemaining: Math.max(0, secondsRemaining),
      approximateYears: Math.max(0, approximateYears)
    });
    
    setIsSubmitted(true);
  };
  
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-select-content]') && !target.closest('[data-select-trigger]')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  // Real-time countdown timer
  useEffect(() => {
    if (!isSubmitted || !deathResults.targetDeathDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = deathResults.targetDeathDate!.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCurrentTime({
          daysRemaining: 0,
          hoursRemaining: 0,
          minutesRemaining: 0,
          secondsRemaining: 0,
          approximateYears: 0
        });
        return;
      }

      const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsRemaining = Math.floor((timeDiff % (1000 * 60)) / 1000);
      const approximateYears = Math.floor(daysRemaining / 365.25);

      setCurrentTime({
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
        approximateYears
      });
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, deathResults.targetDeathDate]);

return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-14">

        {/* Results Page */}
        {isSubmitted ? (
          <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 text-gray-100 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 sm:mb-8">
              <div className="flex-1 mb-6 lg:mb-0">
                <p className="text-xs sm:text-sm text-gray-400 mb-2">Test taken: {deathResults.testDate}.</p>
                <p className="text-base sm:text-lg font-semibold mb-2 text-white leading-relaxed">At time of testing you are {deathResults.currentAge} years, {deathResults.ageInMonths} months and {deathResults.ageInDays} days old.</p>
                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Current age in: Days: ({deathResults.totalDaysLived.toLocaleString()}), Weeks: ({deathResults.totalWeeksLived.toLocaleString()}), Months: ({deathResults.totalMonthsLived})</p>
                
                <p className="text-base sm:text-lg mb-4 text-gray-200 leading-relaxed">
                  Based on our calculations you will die on: <br className="sm:hidden"/><strong className="text-white break-words">{deathResults.deathDate}</strong>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <button 
                    onClick={handleInstagramShare}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg sm:rounded text-sm sm:text-base font-medium transition-colors duration-200 shadow-lg relative overflow-hidden select-none transform-none active:scale-95 flex-1 sm:flex-none"
                    style={{
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.35), 0 0 40px rgba(236, 72, 153, 0.25), 0 0 60px rgba(251, 146, 60, 0.15)'
                    }}
                  >
                    <span className="relative z-10">📱 Share on Instagram</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 opacity-0 hover:opacity-[0.15] active:opacity-[0.25] transition-opacity duration-200"></div>
                  </button>
                  <button className="bg-gray-900 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg sm:rounded text-sm sm:text-base font-medium hover:bg-black active:scale-95 transition-all duration-200 flex-1 sm:flex-none">📝 Post</button>
                </div>
                
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-white leading-tight">You will live to be {deathResults.lifeExpectancy} old!</h2>
                
                <div className="bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-base sm:text-lg mb-2 text-gray-200 leading-relaxed">
                    That's <strong className="text-white text-lg sm:text-xl">{currentTime.daysRemaining.toLocaleString()} Days</strong>, <strong className="text-white">{String(currentTime.hoursRemaining).padStart(2, '0')} Hours</strong>, <strong className="text-white">{String(currentTime.minutesRemaining).padStart(2, '0')} Minutes</strong>, <strong className="text-white">{String(currentTime.secondsRemaining).padStart(2, '0')} Seconds</strong> remaining...
                  </p>
                  <p className="text-base sm:text-lg text-gray-200">Or approx: <strong className="text-white text-lg sm:text-xl">{currentTime.approximateYears} years</strong></p>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">
                  Avg life expectancy of other {formData.sex === 'male' ? 'Male' : 'Female'} testers from {formData.country} with your BMI: <strong className="text-gray-300">Not Enough Data</strong>
                </p>
                
                <div className="flex gap-4 text-blue-400 text-sm">
                  <a href="#" className="underline hover:text-blue-300">Send us your reaction</a>
                  <span className="text-gray-500">|</span>
                  <button 
                    onClick={handleRetakeTest}
                    className="underline hover:text-blue-300 cursor-pointer"
                  >
                    Retake your test
                  </button>
                </div>
              </div>
              
              <div className="lg:ml-8 text-center">
                <div className="bg-gray-700 border border-gray-600 p-4 sm:p-6 rounded-lg max-w-sm mx-auto lg:max-w-none">
                  <p className="text-gray-400 italic mb-2 text-sm sm:text-base">In loving memory</p>
                  <p className="text-gray-400 mb-2 text-sm sm:text-base">Taken from us on</p>
                  <p className="text-base sm:text-lg font-semibold text-white">{deathResults.deathDate.split(',')[0]}</p>
                  <p className="text-base sm:text-lg font-semibold text-white break-words">{deathResults.deathDate.split(', ')[1]}</p>
                  <p className="text-gray-400 italic mt-4 text-sm sm:text-base">rest in peace</p>
                  <div className="mt-4 text-green-400 text-lg sm:text-xl">🌱🪦🌱</div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-green-400 mb-4">New! Cause of death</h3>
              <p className="text-gray-300 mb-4">
                Generate a statistically probable cause of death by clicking the button below, this is weighted by the leading causes of death in the world according to WHO data, for example <em>cardiovascular disease</em> is a much higher % chance than <em>drowning</em>... the button only works once per test!
              </p>
              <Button disabled className="bg-gray-600/50 text-gray-400 px-6 py-2 rounded border border-gray-500/50 cursor-not-allowed opacity-60">
                준비중 - Coming Soon
              </Button>
            </div>
            
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-green-400 mb-4">Share your date of death with friends</h3>
              <p className="text-gray-300">
                You can share your death clock results on Facebook, Twitter or by email below...
              </p>
            </div>

            {/* Health Tips - Our top tips for a longer life */}
            <div className="mt-14">
              <h3 className="text-2xl font-bold text-green-400 mb-4">Our top tips for a longer life</h3>
              <ol className="list-decimal pl-6 space-y-4 text-gray-200">
                <li>
                  <span className="font-semibold text-white">Maintain a Healthy Weight</span> — Maintaining a healthy weight is vital to reduce the risk of developing diseases like diabetes, heart disease, and certain cancers.
                </li>
                <li>
                  <span className="font-semibold text-white">Regular Exercise</span> — Get moving for at least 30 minutes a day. Regular physical activity reduces the risk of chronic diseases like heart disease, diabetes, and certain cancers.
                </li>
                <li>
                  <span className="font-semibold text-white">Stop Smoking</span> — Avoid smoking and second-hand smoke. These can lead to various types of cancer, heart disease, and lung diseases.
                </li>
                <li>
                  <span className="font-semibold text-white">Balanced Diet</span> — Eating a balanced diet full of nutrient-rich fruits, vegetables, lean proteins, and whole grains is critical. Avoid consuming too much processed foods, refined sugars, and unhealthy fats.
                </li>
                <li>
                  <span className="font-semibold text-white">Drink Less (or no) Alcohol</span> — Limit alcohol intake. While occasional social drinking is usually okay, heavy or prolonged drinking can lead to a number of health issues including liver disease, cardiovascular problems, and cancer.
                </li>
                <li>
                  <span className="font-semibold text-white">Good Sleep</span> — Try to get a good night's sleep. Quality sleep is important for overall health and well-being. It affects mood, memory, and healing processes.
                </li>
                <li>
                  <span className="font-semibold text-white">Regular Check-ups</span> — Regular screenings and medical check-ups can help detect problems early. This is especially important for conditions that don't always show noticeable symptoms, like high blood pressure or high cholesterol.
                </li>
                <li>
                  <span className="font-semibold text-white">Manage Stress</span> — Long-term stress can lead to a number of health issues. Practice stress management techniques like mindfulness, meditation, yoga, or other relaxation exercises.
                </li>
                <li>
                  <span className="font-semibold text-white">Maintain Social Connections</span> — Relationships and social interactions are vital for mental health. Loneliness and social isolation can lead to depression and cognitive decline.
                </li>
                <li>
                  <span className="font-semibold text-white">Lifelong Learning</span> — Keep your mind active. Lifelong learning, reading, solving puzzles, or other brain-engaging activities can help to keep your mind sharp and potentially delay the onset of cognitive decline.
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Panel - Personal Information Form */}
          <Card className="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl shadow-lg">
            <CardContent className="p-4 sm:p-6 pt-6 sm:pt-10 space-y-4 sm:space-y-6">
              {/* Date of Birth */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">Date of Birth* <span className="text-xs text-gray-400">(mm/dd/yyyy)</span></Label>
                <div className="flex gap-1 sm:gap-2">
                  {/* Month (MM: 01-12) */}
                  <Select
                    value={formData.birthMonth}
                    onValueChange={(value) => setFormData({ ...formData, birthMonth: value })}
                    open={openDropdown === 'birthMonth'}
                    onOpenChange={(open) => setOpenDropdown(open ? 'birthMonth' : null)}
                  >
                  <SelectTrigger className="flex-1 h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                    <SelectValue placeholder="mm" />
                  </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                      {MONTHS.map((_, index: number) => {
                        const val = (index + 1).toString();
                        const label = (index + 1).toString().padStart(2, '0');
                        return (
                          <SelectItem key={val} value={val}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Day (DD: 01-31) */}
                  <Select
                    value={formData.birthDay}
                    onValueChange={(value) => setFormData({ ...formData, birthDay: value })}
                    open={openDropdown === 'birthDay'}
                    onOpenChange={(open) => setOpenDropdown(open ? 'birthDay' : null)}
                  >
                  <SelectTrigger className="flex-1 h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                    <SelectValue placeholder="dd" />
                  </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                      {days.map((day) => {
                        const val = day.toString();
                        const label = day.toString().padStart(2, '0');
                        return (
                          <SelectItem key={val} value={val}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Year (YYYY) */}
                  <Select
                    value={formData.birthYear}
                    onValueChange={(value) => setFormData({ ...formData, birthYear: value })}
                    open={openDropdown === 'birthYear'}
                    onOpenChange={(open) => setOpenDropdown(open ? 'birthYear' : null)}
                  >
                  <SelectTrigger className="flex-1 h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                    <SelectValue placeholder="yyyy" />
                  </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sex */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">Sex*</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(value) => setFormData({ ...formData, sex: value })}
                  open={openDropdown === 'sex'}
                  onOpenChange={(open) => setOpenDropdown(open ? 'sex' : null)}
                >
                  <SelectTrigger className="h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Do you smoke */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">Do you smoke?</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="smoker"
                    checked={formData.smoker}
                    onCheckedChange={(checked) => setFormData({ ...formData, smoker: checked as boolean })}
                  />
                  <Label htmlFor="smoker" className="text-gray-400">Yes!</Label>
                </div>
              </div>

              {/* BMI */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">BMI*</Label>
                <Select
                  value={formData.bmi}
                  onValueChange={(value) => setFormData({ ...formData, bmi: value })}
                  open={openDropdown === 'bmi'}
                  onOpenChange={(open) => setOpenDropdown(open ? 'bmi' : null)}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Under 25" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                    <SelectItem value="under18.5">Under 18.5</SelectItem>
                    <SelectItem value="18.5-24.9">18.5 - 24.9</SelectItem>
                    <SelectItem value="25-29.9">25 - 29.9</SelectItem>
                    <SelectItem value="30-34.9">30 - 34.9</SelectItem>
                    <SelectItem value="35+">35+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Outlook */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">Outlook</Label>
                <Select
                  value={formData.outlook}
                  onValueChange={(value) => setFormData({ ...formData, outlook: value })}
                  open={openDropdown === 'outlook'}
                  onOpenChange={(open) => setOpenDropdown(open ? 'outlook' : null)}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                    <SelectItem value="optimistic">Optimistic</SelectItem>
                    <SelectItem value="pessimistic">Pessimistic</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alcohol Consumption */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">Alcohol Consumption</Label>
                <Select
                  value={formData.alcoholConsumption}
                  onValueChange={(value) => setFormData({ ...formData, alcoholConsumption: value })}
                  open={openDropdown === 'alcohol'}
                  onOpenChange={(open) => setOpenDropdown(open ? 'alcohol' : null)}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="once-a-month">Once a Month</SelectItem>
                    <SelectItem value="2-4-times-per-month">2-4 Times Per Month</SelectItem>
                    <SelectItem value="2-times-a-week">2 Times A Week</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="constantly-blotto">I'm Constantly Blotto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Country */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">Country*</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                  open={openDropdown === 'country'}
                  onOpenChange={(open) => setOpenDropdown(open ? 'country' : null)}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                    <SelectItem value="Afghanistan">🇦🇫 Afghanistan</SelectItem>
                    <SelectItem value="Albania">🇦🇱 Albania</SelectItem>
                    <SelectItem value="Algeria">🇩🇿 Algeria</SelectItem>
                    <SelectItem value="American Samoa">🇦🇸 American Samoa</SelectItem>
                    <SelectItem value="Andorra">🇦🇩 Andorra</SelectItem>
                    <SelectItem value="Angola">🇦🇴 Angola</SelectItem>
                    <SelectItem value="Anguilla">🇦🇮 Anguilla</SelectItem>
                    <SelectItem value="Antarctica">🇦🇶 Antarctica</SelectItem>
                    <SelectItem value="Antigua and Barbuda">🇦🇬 Antigua and Barbuda</SelectItem>
                    <SelectItem value="Argentina">🇦🇷 Argentina</SelectItem>
                    <SelectItem value="Armenia">🇦🇲 Armenia</SelectItem>
                    <SelectItem value="Aruba">🇦🇼 Aruba</SelectItem>
                    <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                    <SelectItem value="Austria">🇦🇹 Austria</SelectItem>
                    <SelectItem value="Azerbaijan">🇦🇿 Azerbaijan</SelectItem>
                    <SelectItem value="Bahamas">🇧🇸 Bahamas</SelectItem>
                    <SelectItem value="Bahrain">🇧🇭 Bahrain</SelectItem>
                    <SelectItem value="Bangladesh">🇧🇩 Bangladesh</SelectItem>
                    <SelectItem value="Barbados">🇧🇧 Barbados</SelectItem>
                    <SelectItem value="Belarus">🇧🇾 Belarus</SelectItem>
                    <SelectItem value="Belgium">🇧🇪 Belgium</SelectItem>
                    <SelectItem value="Belize">🇧🇿 Belize</SelectItem>
                    <SelectItem value="Benin">🇧🇯 Benin</SelectItem>
                    <SelectItem value="Bermuda">🇧🇲 Bermuda</SelectItem>
                    <SelectItem value="Bhutan">🇧🇹 Bhutan</SelectItem>
                    <SelectItem value="Bolivia">🇧🇴 Bolivia</SelectItem>
                    <SelectItem value="Bosnia and Herzegovina">🇧🇦 Bosnia and Herzegovina</SelectItem>
                    <SelectItem value="Botswana">🇧🇼 Botswana</SelectItem>
                    <SelectItem value="Bouvet Island">🇧🇻 Bouvet Island</SelectItem>
                    <SelectItem value="Brazil">🇧🇷 Brazil</SelectItem>
                    <SelectItem value="British Indian Ocean Territory">🇮🇴 British Indian Ocean Territory</SelectItem>
                    <SelectItem value="Brunei Darussalam">🇧🇳 Brunei Darussalam</SelectItem>
                    <SelectItem value="Bulgaria">🇧🇬 Bulgaria</SelectItem>
                    <SelectItem value="Burkina Faso">🇧🇫 Burkina Faso</SelectItem>
                    <SelectItem value="Burundi">🇧🇮 Burundi</SelectItem>
                    <SelectItem value="Cambodia">🇰🇭 Cambodia</SelectItem>
                    <SelectItem value="Cameroon">🇨🇲 Cameroon</SelectItem>
                    <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                    <SelectItem value="Cape Verde">🇨🇻 Cape Verde</SelectItem>
                    <SelectItem value="Cayman Islands">🇰🇾 Cayman Islands</SelectItem>
                    <SelectItem value="Central African Republic">🇨🇫 Central African Republic</SelectItem>
                    <SelectItem value="Chad">🇹🇩 Chad</SelectItem>
                    <SelectItem value="Chile">🇨🇱 Chile</SelectItem>
                    <SelectItem value="China">🇨🇳 China</SelectItem>
                    <SelectItem value="Christmas Island">🇨🇽 Christmas Island</SelectItem>
                    <SelectItem value="Cocos (Keeling) Islands">🇨🇨 Cocos (Keeling) Islands</SelectItem>
                    <SelectItem value="Colombia">🇨🇴 Colombia</SelectItem>
                    <SelectItem value="Comoros">🇰🇲 Comoros</SelectItem>
                    <SelectItem value="Congo">🇨🇬 Congo</SelectItem>
                    <SelectItem value="Congo, The Democratic Republic of the">🇨🇩 Congo, The Democratic Republic of the</SelectItem>
                    <SelectItem value="Cook Islands">🇨🇰 Cook Islands</SelectItem>
                    <SelectItem value="Costa Rica">🇨🇷 Costa Rica</SelectItem>
                    <SelectItem value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</SelectItem>
                    <SelectItem value="Croatia">🇭🇷 Croatia</SelectItem>
                    <SelectItem value="Cuba">🇨🇺 Cuba</SelectItem>
                    <SelectItem value="Cyprus">🇨🇾 Cyprus</SelectItem>
                    <SelectItem value="Czech Republic">🇨🇿 Czech Republic</SelectItem>
                    <SelectItem value="Denmark">🇩🇰 Denmark</SelectItem>
                    <SelectItem value="Djibouti">🇩🇯 Djibouti</SelectItem>
                    <SelectItem value="Dominica">🇩🇲 Dominica</SelectItem>
                    <SelectItem value="Dominican Republic">🇩🇴 Dominican Republic</SelectItem>
                    <SelectItem value="Ecuador">🇪🇨 Ecuador</SelectItem>
                    <SelectItem value="Egypt">🇪🇬 Egypt</SelectItem>
                    <SelectItem value="El Salvador">🇸🇻 El Salvador</SelectItem>
                    <SelectItem value="Equatorial Guinea">🇬🇶 Equatorial Guinea</SelectItem>
                    <SelectItem value="Eritrea">🇪🇷 Eritrea</SelectItem>
                    <SelectItem value="Estonia">🇪🇪 Estonia</SelectItem>
                    <SelectItem value="Ethiopia">🇪🇹 Ethiopia</SelectItem>
                    <SelectItem value="Falkland Islands (Malvinas)">🇫🇰 Falkland Islands (Malvinas)</SelectItem>
                    <SelectItem value="Faroe Islands">🇫🇴 Faroe Islands</SelectItem>
                    <SelectItem value="Fiji">🇫🇯 Fiji</SelectItem>
                    <SelectItem value="Finland">🇫🇮 Finland</SelectItem>
                    <SelectItem value="France">🇫🇷 France</SelectItem>
                    <SelectItem value="French Guiana">🇬🇫 French Guiana</SelectItem>
                    <SelectItem value="French Polynesia">🇵🇫 French Polynesia</SelectItem>
                    <SelectItem value="French Southern Territories">🇹🇫 French Southern Territories</SelectItem>
                    <SelectItem value="Gabon">🇬🇦 Gabon</SelectItem>
                    <SelectItem value="Gambia">🇬🇲 Gambia</SelectItem>
                    <SelectItem value="Georgia">🇬🇪 Georgia</SelectItem>
                    <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                    <SelectItem value="Ghana">🇬🇭 Ghana</SelectItem>
                    <SelectItem value="Gibraltar">🇬🇮 Gibraltar</SelectItem>
                    <SelectItem value="Greece">🇬🇷 Greece</SelectItem>
                    <SelectItem value="Greenland">🇬🇱 Greenland</SelectItem>
                    <SelectItem value="Grenada">🇬🇩 Grenada</SelectItem>
                    <SelectItem value="Guadeloupe">🇬🇵 Guadeloupe</SelectItem>
                    <SelectItem value="Guam">🇬🇺 Guam</SelectItem>
                    <SelectItem value="Guatemala">🇬🇹 Guatemala</SelectItem>
                    <SelectItem value="Guinea">🇬🇳 Guinea</SelectItem>
                    <SelectItem value="Guinea-Bissau">🇬🇼 Guinea-Bissau</SelectItem>
                    <SelectItem value="Guyana">🇬🇾 Guyana</SelectItem>
                    <SelectItem value="Haiti">🇭🇹 Haiti</SelectItem>
                    <SelectItem value="Heard Island and McDonald Islands">🇭🇲 Heard Island and McDonald Islands</SelectItem>
                    <SelectItem value="Holy See (Vatican City State)">🇻🇦 Holy See (Vatican City State)</SelectItem>
                    <SelectItem value="Honduras">🇭🇳 Honduras</SelectItem>
                    <SelectItem value="Hong Kong">🇭🇰 Hong Kong</SelectItem>
                    <SelectItem value="Hungary">🇭🇺 Hungary</SelectItem>
                    <SelectItem value="Iceland">🇮🇸 Iceland</SelectItem>
                    <SelectItem value="India">🇮🇳 India</SelectItem>
                    <SelectItem value="Indonesia">🇮🇩 Indonesia</SelectItem>
                    <SelectItem value="Iran, Islamic Republic of">🇮🇷 Iran, Islamic Republic of</SelectItem>
                    <SelectItem value="Iraq">🇮🇶 Iraq</SelectItem>
                    <SelectItem value="Ireland">🇮🇪 Ireland</SelectItem>
                    <SelectItem value="Israel">🇮🇱 Israel</SelectItem>
                    <SelectItem value="Italy">🇮🇹 Italy</SelectItem>
                    <SelectItem value="Jamaica">🇯🇲 Jamaica</SelectItem>
                    <SelectItem value="Japan">🇯🇵 Japan</SelectItem>
                    <SelectItem value="Jordan">🇯🇴 Jordan</SelectItem>
                    <SelectItem value="Kazakhstan">🇰🇿 Kazakhstan</SelectItem>
                    <SelectItem value="Kenya">🇰🇪 Kenya</SelectItem>
                    <SelectItem value="Kiribati">🇰🇮 Kiribati</SelectItem>
                    <SelectItem value="Korea, Democratic People's Republic of">🇰🇵 Korea, Democratic People's Republic of</SelectItem>
                    <SelectItem value="South Korea">🇰🇷 South Korea</SelectItem>
                    <SelectItem value="Kuwait">🇰🇼 Kuwait</SelectItem>
                    <SelectItem value="Kyrgyzstan">🇰🇬 Kyrgyzstan</SelectItem>
                    <SelectItem value="Lao People's Democratic Republic">🇱🇦 Lao People's Democratic Republic</SelectItem>
                    <SelectItem value="Latvia">🇱🇻 Latvia</SelectItem>
                    <SelectItem value="Lebanon">🇱🇧 Lebanon</SelectItem>
                    <SelectItem value="Lesotho">🇱🇸 Lesotho</SelectItem>
                    <SelectItem value="Liberia">🇱🇷 Liberia</SelectItem>
                    <SelectItem value="Libyan Arab Jamahiriya">🇱🇾 Libyan Arab Jamahiriya</SelectItem>
                    <SelectItem value="Liechtenstein">🇱🇮 Liechtenstein</SelectItem>
                    <SelectItem value="Lithuania">🇱🇹 Lithuania</SelectItem>
                    <SelectItem value="Luxembourg">🇱🇺 Luxembourg</SelectItem>
                    <SelectItem value="Macao">🇲🇴 Macao</SelectItem>
                    <SelectItem value="Macedonia, The Former Yugoslav Republic of">🇲🇰 Macedonia, The Former Yugoslav Republic of</SelectItem>
                    <SelectItem value="Madagascar">🇲🇬 Madagascar</SelectItem>
                    <SelectItem value="Malawi">🇲🇼 Malawi</SelectItem>
                    <SelectItem value="Malaysia">🇲🇾 Malaysia</SelectItem>
                    <SelectItem value="Maldives">🇲🇻 Maldives</SelectItem>
                    <SelectItem value="Mali">🇲🇱 Mali</SelectItem>
                    <SelectItem value="Malta">🇲🇹 Malta</SelectItem>
                    <SelectItem value="Marshall Islands">🇲🇭 Marshall Islands</SelectItem>
                    <SelectItem value="Martinique">🇲🇶 Martinique</SelectItem>
                    <SelectItem value="Mauritania">🇲🇷 Mauritania</SelectItem>
                    <SelectItem value="Mauritius">🇲🇺 Mauritius</SelectItem>
                    <SelectItem value="Mayotte">🇾🇹 Mayotte</SelectItem>
                    <SelectItem value="Mexico">🇲🇽 Mexico</SelectItem>
                    <SelectItem value="Micronesia, Federated States of">🇫🇲 Micronesia, Federated States of</SelectItem>
                    <SelectItem value="Moldova, Republic of">🇲🇩 Moldova, Republic of</SelectItem>
                    <SelectItem value="Monaco">🇲🇨 Monaco</SelectItem>
                    <SelectItem value="Mongolia">🇲🇳 Mongolia</SelectItem>
                    <SelectItem value="Montenegro">🇲🇪 Montenegro</SelectItem>
                    <SelectItem value="Montserrat">🇲🇸 Montserrat</SelectItem>
                    <SelectItem value="Morocco">🇲🇦 Morocco</SelectItem>
                    <SelectItem value="Mozambique">🇲🇿 Mozambique</SelectItem>
                    <SelectItem value="Myanmar">🇲🇲 Myanmar</SelectItem>
                    <SelectItem value="Namibia">🇳🇦 Namibia</SelectItem>
                    <SelectItem value="Nauru">🇳🇷 Nauru</SelectItem>
                    <SelectItem value="Nepal">🇳🇵 Nepal</SelectItem>
                    <SelectItem value="Netherlands">🇳🇱 Netherlands</SelectItem>
                    <SelectItem value="Netherlands Antilles">🇦🇳 Netherlands Antilles</SelectItem>
                    <SelectItem value="New Caledonia">🇳🇨 New Caledonia</SelectItem>
                    <SelectItem value="New Zealand">🇳🇿 New Zealand</SelectItem>
                    <SelectItem value="Nicaragua">🇳🇮 Nicaragua</SelectItem>
                    <SelectItem value="Niger">🇳🇪 Niger</SelectItem>
                    <SelectItem value="Nigeria">🇳🇬 Nigeria</SelectItem>
                    <SelectItem value="Niue">🇳🇺 Niue</SelectItem>
                    <SelectItem value="Norfolk Island">🇳🇫 Norfolk Island</SelectItem>
                    <SelectItem value="Northern Mariana Islands">🇲🇵 Northern Mariana Islands</SelectItem>
                    <SelectItem value="Norway">🇳🇴 Norway</SelectItem>
                    <SelectItem value="Oman">🇴🇲 Oman</SelectItem>
                    <SelectItem value="Pakistan">🇵🇰 Pakistan</SelectItem>
                    <SelectItem value="Palau">🇵🇼 Palau</SelectItem>
                    <SelectItem value="Palestinian Territory, Occupied">🇵🇸 Palestinian Territory, Occupied</SelectItem>
                    <SelectItem value="Panama">🇵🇦 Panama</SelectItem>
                    <SelectItem value="Papua New Guinea">🇵🇬 Papua New Guinea</SelectItem>
                    <SelectItem value="Paraguay">🇵🇾 Paraguay</SelectItem>
                    <SelectItem value="Peru">🇵🇪 Peru</SelectItem>
                    <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                    <SelectItem value="Pitcairn">🇵🇳 Pitcairn</SelectItem>
                    <SelectItem value="Poland">🇵🇱 Poland</SelectItem>
                    <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
                    <SelectItem value="Puerto Rico">🇵🇷 Puerto Rico</SelectItem>
                    <SelectItem value="Qatar">🇶🇦 Qatar</SelectItem>
                    <SelectItem value="Réunion">🇷🇪 Réunion</SelectItem>
                    <SelectItem value="Romania">🇷🇴 Romania</SelectItem>
                    <SelectItem value="Russian Federation">🇷🇺 Russian Federation</SelectItem>
                    <SelectItem value="Rwanda">🇷🇼 Rwanda</SelectItem>
                    <SelectItem value="Saint Helena">🇸🇭 Saint Helena</SelectItem>
                    <SelectItem value="Saint Kitts and Nevis">🇰🇳 Saint Kitts and Nevis</SelectItem>
                    <SelectItem value="Saint Lucia">🇱🇨 Saint Lucia</SelectItem>
                    <SelectItem value="Saint Pierre and Miquelon">🇵🇲 Saint Pierre and Miquelon</SelectItem>
                    <SelectItem value="Saint Vincent and the Grenadines">🇻🇨 Saint Vincent and the Grenadines</SelectItem>
                    <SelectItem value="Samoa">🇼🇸 Samoa</SelectItem>
                    <SelectItem value="San Marino">🇸🇲 San Marino</SelectItem>
                    <SelectItem value="Sao Tome and Principe">🇸🇹 Sao Tome and Principe</SelectItem>
                    <SelectItem value="Saudi Arabia">🇸🇦 Saudi Arabia</SelectItem>
                    <SelectItem value="Senegal">🇸🇳 Senegal</SelectItem>
                    <SelectItem value="Serbia">🇷🇸 Serbia</SelectItem>
                    <SelectItem value="Seychelles">🇸🇨 Seychelles</SelectItem>
                    <SelectItem value="Sierra Leone">🇸🇱 Sierra Leone</SelectItem>
                    <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                    <SelectItem value="Slovakia">🇸🇰 Slovakia</SelectItem>
                    <SelectItem value="Slovenia">🇸🇮 Slovenia</SelectItem>
                    <SelectItem value="Solomon Islands">🇸🇧 Solomon Islands</SelectItem>
                    <SelectItem value="Somalia">🇸🇴 Somalia</SelectItem>
                    <SelectItem value="South Africa">🇿🇦 South Africa</SelectItem>
                    <SelectItem value="South Georgia and the South Sandwich Islands">🇬🇸 South Georgia and the South Sandwich Islands</SelectItem>
                    <SelectItem value="Spain">🇪🇸 Spain</SelectItem>
                    <SelectItem value="Sri Lanka">🇱🇰 Sri Lanka</SelectItem>
                    <SelectItem value="Sudan">🇸🇩 Sudan</SelectItem>
                    <SelectItem value="Suriname">🇸🇷 Suriname</SelectItem>
                    <SelectItem value="Svalbard and Jan Mayen">🇸🇯 Svalbard and Jan Mayen</SelectItem>
                    <SelectItem value="Swaziland">🇸🇿 Swaziland</SelectItem>
                    <SelectItem value="Sweden">🇸🇪 Sweden</SelectItem>
                    <SelectItem value="Switzerland">🇨🇭 Switzerland</SelectItem>
                    <SelectItem value="Syrian Arab Republic">🇸🇾 Syrian Arab Republic</SelectItem>
                    <SelectItem value="Taiwan, Province of China">🇹🇼 Taiwan, Province of China</SelectItem>
                    <SelectItem value="Tajikistan">🇹🇯 Tajikistan</SelectItem>
                    <SelectItem value="Tanzania, United Republic of">🇹🇿 Tanzania, United Republic of</SelectItem>
                    <SelectItem value="Thailand">🇹🇭 Thailand</SelectItem>
                    <SelectItem value="Timor-Leste">🇹🇱 Timor-Leste</SelectItem>
                    <SelectItem value="Togo">🇹🇬 Togo</SelectItem>
                    <SelectItem value="Tokelau">🇹🇰 Tokelau</SelectItem>
                    <SelectItem value="Tonga">🇹🇴 Tonga</SelectItem>
                    <SelectItem value="Trinidad and Tobago">🇹🇹 Trinidad and Tobago</SelectItem>
                    <SelectItem value="Tunisia">🇹🇳 Tunisia</SelectItem>
                    <SelectItem value="Turkey">🇹🇷 Turkey</SelectItem>
                    <SelectItem value="Turkmenistan">🇹🇲 Turkmenistan</SelectItem>
                    <SelectItem value="Turks and Caicos Islands">🇹🇨 Turks and Caicos Islands</SelectItem>
                    <SelectItem value="Tuvalu">🇹🇻 Tuvalu</SelectItem>
                    <SelectItem value="Uganda">🇺🇬 Uganda</SelectItem>
                    <SelectItem value="Ukraine">🇺🇦 Ukraine</SelectItem>
                    <SelectItem value="United Arab Emirates">🇦🇪 United Arab Emirates</SelectItem>
                    <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="United States">🇺🇸 United States</SelectItem>
                    <SelectItem value="United States Minor Outlying Islands">🇺🇲 United States Minor Outlying Islands</SelectItem>
                    <SelectItem value="Uruguay">🇺🇾 Uruguay</SelectItem>
                    <SelectItem value="Uzbekistan">🇺🇿 Uzbekistan</SelectItem>
                    <SelectItem value="Vanuatu">🇻🇺 Vanuatu</SelectItem>
                    <SelectItem value="Venezuela">🇻🇪 Venezuela</SelectItem>
                    <SelectItem value="Viet Nam">🇻🇳 Viet Nam</SelectItem>
                    <SelectItem value="Virgin Islands, British">🇻🇬 Virgin Islands, British</SelectItem>
                    <SelectItem value="Virgin Islands, U.S.">🇻🇮 Virgin Islands, U.S.</SelectItem>
                    <SelectItem value="Wallis and Futuna">🇼🇫 Wallis and Futuna</SelectItem>
                    <SelectItem value="Western Sahara">🇪🇭 Western Sahara</SelectItem>
                    <SelectItem value="Yemen">🇾🇪 Yemen</SelectItem>
                    <SelectItem value="Zambia">🇿🇲 Zambia</SelectItem>
                    <SelectItem value="Zimbabwe">🇿🇼 Zimbabwe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include fitness & diet */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="fitness"
                    checked={formData.includeFitnessDiet}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeFitnessDiet: checked as boolean })}
                  />
                  <Label htmlFor="fitness" className="text-gray-400">Include fitness & diet?</Label>
                </div>

                {/* Level of Fitness - only show when checkbox is checked */}
                {formData.includeFitnessDiet && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block text-sm font-medium text-gray-200">Level of Fitness</Label>
                      <Select
                        value={formData.fitnessLevel}
                        onValueChange={(value) => setFormData({ ...formData, fitnessLevel: value })}
                        open={openDropdown === 'fitnessLevel'}
                        onOpenChange={(open) => setOpenDropdown(open ? 'fitnessLevel' : null)}
                      >
                        <SelectTrigger className="h-10 rounded-lg bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Choose..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                          <SelectItem value="couch-potato">Couch Potato</SelectItem>
                          <SelectItem value="moderately-active">Moderately active</SelectItem>
                          <SelectItem value="very-active">Very Active</SelectItem>
                          <SelectItem value="ironman">I'm Ironman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm font-medium text-gray-200">Diet Rating</Label>
                      <Select
                        value={formData.dietRating}
                        onValueChange={(value) => setFormData({ ...formData, dietRating: value })}
                        open={openDropdown === 'dietRating'}
                        onOpenChange={(open) => setOpenDropdown(open ? 'dietRating' : null)}
                      >
                        <SelectTrigger className="h-10 rounded-lg bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Choose..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                          <SelectItem value="terrible">Terrible</SelectItem>
                          <SelectItem value="ok">OK</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`w-full sm:w-40 h-12 sm:h-10 rounded-lg backdrop-blur-md border text-white transition-all duration-200 font-medium text-base sm:text-sm active:scale-95 ${
                  isFormValid 
                    ? 'animate-color-cycle hover:opacity-90 cursor-pointer' 
                    : 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                🚀 Submit
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - BMI Calculator */}
          <Card className="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-gray-100 text-lg sm:text-xl">📊 BMI Calculator</CardTitle>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">Please select a measurement for your height and weight</p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Weight */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">⚖️ Weight - Choose one</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-gray-400 text-sm mb-1 block">kg</Label>
                    <Select
                      value={bmiData.weightUnit === 'kilos' ? bmiData.weightValue : ''}
                      onValueChange={(value) => setBmiData({ ...bmiData, weightUnit: 'kilos', weightValue: value })}
                      open={openDropdown === 'weightKilos'}
                      onOpenChange={(open) => setOpenDropdown(open ? 'weightKilos' : null)}
                    >
                      <SelectTrigger className="h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                        {Array.from({ length: 200 }, (_, i) => i + 30).map((weight) => (
                          <SelectItem key={weight} value={weight.toString()}>
                            {weight} kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm mb-1 block">lbs</Label>
                    <Select
                      value={bmiData.weightUnit === 'pounds' ? bmiData.weightValue : ''}
                      onValueChange={(value) => setBmiData({ ...bmiData, weightUnit: 'pounds', weightValue: value })}
                      open={openDropdown === 'weightPounds'}
                      onOpenChange={(open) => setOpenDropdown(open ? 'weightPounds' : null)}
                    >
                      <SelectTrigger className="h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                        {Array.from({ length: 400 }, (_, i) => i + 70).map((weight) => (
                          <SelectItem key={weight} value={weight.toString()}>
                            {weight} lbs
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Height */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-200">📏 Height - Choose one</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-gray-400 text-sm mb-1 block">cm</Label>
                    <Select
                      value={bmiData.heightUnit === 'cm' ? bmiData.heightValue : ''}
                      onValueChange={(value) => setBmiData({ ...bmiData, heightUnit: 'cm', heightValue: value })}
                      open={openDropdown === 'heightCm'}
                      onOpenChange={(open) => setOpenDropdown(open ? 'heightCm' : null)}
                    >
                      <SelectTrigger className="h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                        {Array.from({ length: 100 }, (_, i) => i + 140).map((height) => (
                          <SelectItem key={height} value={height.toString()}>
                            {height} cm
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm mb-1 block">inches</Label>
                    <Select
                      value={bmiData.heightUnit === 'inches' ? bmiData.heightValue : ''}
                      onValueChange={(value) => setBmiData({ ...bmiData, heightUnit: 'inches', heightValue: value })}
                      open={openDropdown === 'heightInches'}
                      onOpenChange={(open) => setOpenDropdown(open ? 'heightInches' : null)}
                    >
                      <SelectTrigger className="h-12 sm:h-10 rounded-lg bg-gray-700 border-gray-600 text-white text-sm sm:text-base">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border border-gray-600 text-white">
                        {Array.from({ length: 36 }, (_, i) => i + 48).map((height) => (
                          <SelectItem key={height} value={height.toString()}>
                            {Math.floor(height / 12)}'{height % 12}" 
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                onClick={calculateBMI}
                className="w-full sm:w-auto h-12 sm:h-10 rounded-lg backdrop-blur-md border text-white animate-color-cycle transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base sm:text-sm active:scale-95"
                disabled={!bmiData.weightValue || !bmiData.heightValue}
              >
                🧮 Calculate
              </Button>

              {/* BMI Results */}
              {calculatedBMI && (
                <div className="mt-6 space-y-6">
                  <div className="bg-gray-800 border border-gray-600 p-6 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-4 text-gray-100">Your BMI Results</h3>
                    
                    <div className="mb-6">
                      <p className="text-gray-300 mb-3">We have calculated your BMI to be:</p>
                      <p className="text-5xl font-bold text-center text-white mb-2">{calculatedBMI}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-4 text-gray-200">BMI Guide:</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center">
                          <span className="text-blue-400 mr-2">•</span>
                          <span>Under 18.5 - </span>
                          <span className="font-semibold ml-1 text-blue-400">Underweight</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">•</span>
                          <span>18.5-24.9 - </span>
                          <span className="font-semibold ml-1 text-green-400">Normal</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-yellow-400 mr-2">•</span>
                          <span>25-29.9 - </span>
                          <span className="font-semibold ml-1 text-yellow-400">Overweight</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-orange-400 mr-2">•</span>
                          <span>30+ - </span>
                          <span className="font-semibold ml-1 text-orange-400">Obese</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-red-400 mr-2">•</span>
                          <span>40+ - </span>
                          <span className="font-semibold ml-1 text-red-400">Seriously Obese</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom text */}
        <div className="mt-8 sm:mt-10 text-center text-xs sm:text-sm text-gray-400 max-w-3xl mx-auto px-2 sm:px-4">
          <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 space-y-3">
            <p className="leading-relaxed">
              🏃‍♂️ As your BMI is a good indication of a healthy lifestyle it has the biggest effect on your prediction. It is never too late to adapt to healthy living,
              a diet intake that balances you over physical excersion is the key to your health goal.
            </p>
            <p className="leading-relaxed">
              🐹 Ready? Hit submit and our hamster AI will spin up their wheels and report your personalised death clock so you can make a note in your diary.
            </p>
            <p className="text-xs text-gray-500 font-medium">
              ⚠️ *Should be used for fun only. This calculator is unlikely to predict your actual date of death.
            </p>
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}