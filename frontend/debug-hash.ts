
const hash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

console.log('admin975:', hash('admin975'));
console.log('kitchenxxx:', hash('kitchenxxx'));
console.log('cashierxxx:', hash('cashierxxx'));
