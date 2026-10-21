const regex = {
  dateVlidation: /^\d{4}-\d{2}-\d{2}$/,
  videoUrl:
    /^(https?:\/\/)?([a-zA-Z0-9.-]+)(\.[a-zA-Z]{2,})(:[0-9]{1,5})?(\/[\w.~:/?#[\]@!$&'()*+,;=%-]*)?$/,
  linkRegax: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/[^\s]*)?$/,
  price: /^[+]?\d+(\.\d{1,2})?$/,
  facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.*/,
  twitter: /^(https?:\/\/)?(www\.)?twitter\.com\/.*/,
  linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*/,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.*/,
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*/,
  playstore: /^(https?:\/\/)?(www\.)?play\.google\.com\/.*/,
  appstore: /^(https?:\/\/)?(www\.)?apps\.apple\.com\/.*/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  mobileNUmber: /^[6-9]\d{9}$/,
  noNumber: /^[^0-9]*$/,
  unlocode: /^[A-Za-z]{5}$/,
  code: /^\d{5}$/,
  unlocs: /^[A-Za-z]{5}$/,
  acceptCharecters: /^[a-zA-Z\s]*$/,
  name: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
  coordinates: /^-?\d+(\.\d+)?$/,
  passwordRegex:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  vci: /^[A-Z]{2}-\d{4,10}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  accountNumber: /^\d{9,18}$/,
  upiId: /^[\w.-]+@[\w.-]+$/,
  phoneRegex: /(\+?\d{1,3}[-.\s]?)?\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4}/,
  socialRegex: /(@\w+|instagram|facebook|linkedin|twitter|x\.com|https?:\/\/)/i,
  urlRegex: /(https?:\/\/|www\.)/i,
}
export { regex }

const blockedWords = [
  'clinic',
  'hospital',
  'vet clinic',
  'instagram',
  'facebook',
  'linkedin',
  'twitter',
  'whatsapp',
  'telegram',
]
export { blockedWords }
