export const statesAndCities: { state: string; cities: string[] }[] = [
  {
    state: 'Andhra Pradesh',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
  },
  {
    state: 'Arunachal Pradesh',
    cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  },
  { state: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'] },
  { state: 'Bihar', cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'] },
  {
    state: 'Chhattisgarh',
    cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Durg'],
  },
  { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Ponda'] },
  {
    state: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Mehsana'],
  },
  { state: 'Haryana', cities: ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala'] },
  {
    state: 'Himachal Pradesh',
    cities: ['Shimla', 'Mandi', 'Dharamshala', 'Kullu'],
  },
  {
    state: 'Jharkhand',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  },
  {
    state: 'Karnataka',
    cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
  },
  {
    state: 'Kerala',
    cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam'],
  },
  {
    state: 'Madhya Pradesh',
    cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane'] },
  {
    state: 'Manipur',
    cities: ['Imphal', 'Thoubal', 'Churachandpur', 'Bishnupur'],
  },
  { state: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'] },
  { state: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
  {
    state: 'Nagaland',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  },
  { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'] },
  {
    state: 'Punjab',
    cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
  },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  { state: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Mangan', 'Jorethang'] },
  {
    state: 'Tamil Nadu',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  },
  {
    state: 'Telangana',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  },
  {
    state: 'Tripura',
    cities: ['Agartala', 'Udaipur', 'Belonia', 'Dharmanagar'],
  },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'] },
  {
    state: 'Uttarakhand',
    cities: ['Dehradun', 'Haridwar', 'Nainital', 'Roorkee'],
  },
  {
    state: 'West Bengal',
    cities: ['Kolkata', 'Howrah', 'Asansol', 'Siliguri'],
  },
]

export function citiesForState(state: string) {
  return statesAndCities.find((item) => item.state === state)?.cities ?? []
}
