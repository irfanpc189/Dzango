import type { Destination, VerifiedFact } from './destinations';
import type { ImageId } from './images';

export type StateRecord = { slug: string; name: string; kind: 'state' | 'union-territory'; tier: 'flagship' | 'standard' | 'light'; intro?: string; heroImage?: ImageId; destinations: Destination['id'][]; facts?: { bestSeason?: VerifiedFact<string> } };
const stateNames: Array<[string, string]> = [
  ['andhra-pradesh','Andhra Pradesh'],['arunachal-pradesh','Arunachal Pradesh'],['assam','Assam'],['bihar','Bihar'],['chhattisgarh','Chhattisgarh'],['goa','Goa'],['gujarat','Gujarat'],['haryana','Haryana'],['himachal-pradesh','Himachal Pradesh'],['jharkhand','Jharkhand'],['karnataka','Karnataka'],['kerala','Kerala'],['madhya-pradesh','Madhya Pradesh'],['maharashtra','Maharashtra'],['manipur','Manipur'],['meghalaya','Meghalaya'],['mizoram','Mizoram'],['nagaland','Nagaland'],['odisha','Odisha'],['punjab','Punjab'],['rajasthan','Rajasthan'],['sikkim','Sikkim'],['tamil-nadu','Tamil Nadu'],['telangana','Telangana'],['tripura','Tripura'],['uttar-pradesh','Uttar Pradesh'],['uttarakhand','Uttarakhand'],['west-bengal','West Bengal'],
  ['andaman-and-nicobar-islands','Andaman and Nicobar Islands'],['chandigarh','Chandigarh'],['dadra-and-nagar-haveli-and-daman-and-diu','Dadra and Nagar Haveli and Daman and Diu'],['delhi','Delhi'],['jammu-and-kashmir','Jammu and Kashmir'],['ladakh','Ladakh'],['lakshadweep','Lakshadweep'],['puducherry','Puducherry'],
];
export const states: StateRecord[] = stateNames.map(([slug, name]) => ({ slug, name, kind: slug === 'ladakh' || ['andaman-and-nicobar-islands','chandigarh','dadra-and-nagar-haveli-and-daman-and-diu','delhi','jammu-and-kashmir','lakshadweep','puducherry'].includes(slug) ? 'union-territory' : 'state', tier: 'standard', destinations: slug === 'ladakh' ? ['ladakh'] : slug === 'kerala' ? ['alleppey'] : slug === 'meghalaya' ? ['cherrapunji'] : [] }));
export const getState = (slug: string) => states.find((state) => state.slug === slug);
