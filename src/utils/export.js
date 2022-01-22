const API_URL = "/api/v1/";

export function fetchData(username) {
  return fetch(API_URL + username).then(res => res.json());
}

export function cleanUsername(username){
  return username.replace(/^(http|https):\/\/(?!www\.)github\.com\//, '');
}

export function getDateStr(pastOffsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() - pastOffsetDays);
  return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
}

export function contributionsToCounts(data){
  const dateStr = getDateStr();
  const foundIndex = Math.max(data.contributions.findIndex(e => e.date === dateStr), 0);
  const latestContributions = data.contributions.slice(foundIndex, foundIndex + 141).map(e => e.count);
  return latestContributions;
}

export function normalizedCountToColor(count, threshold) {
  if(count == 0) return '⬜';
  else if(count <= threshold) return '🟨';
  else return '🟩';
};
