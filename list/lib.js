// A bunch of commonly used functions. Yay!

// maths 👍
export function calcMaxListPoints(position, listLength, maxPoints=500) {
  // https://www.desmos.com/calculator/w8wecauguz
  return Math.round((Math.pow((((-7*Math.sqrt(maxPoints-1))/(listLength-1))*(position+1-listLength))/7, 2) + 1)*100)/100
}

export function calcListPointsWithPerc(listPercent, achievedPercent, levelPoints) {
  return calcMaxListPoints(achievedPercent-listPercent, listPercent, levelPoints)
}
export async function fetchlist() {
  try {
    const response = await fetch("/list/list.json")
    const list = await response.json();
    return list;
  } catch (error) {
    console.error(error);
  }
}