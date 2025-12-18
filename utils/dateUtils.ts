// Saskatoon is always CST (UTC-6), no Daylight Saving Time.
const SASKATOON_TIMEZONE = 'America/Regina';

export const getSaskatoonDate = (): Date => {
  const now = new Date();
  // We use Intl to get the specific time string for Saskatoon, then parse it back to a date object
  // to perform hour comparisons relative to that zone.
  const saskatoonString = now.toLocaleString('en-US', { timeZone: SASKATOON_TIMEZONE });
  return new Date(saskatoonString);
};

export const isHappyHourActive = (): boolean => {
  const localDate = getSaskatoonDate();
  const hours = localDate.getHours();
  // Happy Hour starts at 5:00 PM (17:00)
  return hours >= 17;
};

export const getDayOfWeek = (): number => {
  const localDate = getSaskatoonDate();
  return localDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
};

export const formatToSaskatoonTime = (isoString: string): { date: string; time: string } => {
  try {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = { timeZone: SASKATOON_TIMEZONE };
    
    // en-CA results in YYYY-MM-DD
    const dateStr = date.toLocaleDateString('en-CA', options);
    
    // 24-hour format HH:mm
    const timeStr = date.toLocaleTimeString('en-CA', { 
      ...options, 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return { date: dateStr, time: timeStr };
  } catch (e) {
    return { date: isoString, time: '' };
  }
};