export const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
export const rpName = process.env.NEXT_PUBLIC_RP_NAME || 'VitaPass';
export const origin = process.env.NODE_ENV === 'production' 
  ? `https://${rpID}` 
  : `http://${rpID}:3000`;
