/**
 * Convert date to MySQL datetime format
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} MySQL formatted datetime (YYYY-MM-DD HH:MM:SS)
 */
function toMySQLDatetime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = { toMySQLDatetime };