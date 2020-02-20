const fs = require("fs");
const filename = process.argv[2];

let inputData;
inputData = fs
  .readFileSync(filename, "utf8")
  .trim()
  .split("\n");

const [booksCount, librariesCount, totalTime] = inputData
  .shift()
  .split(" ")
  .map(v => parseInt(v, 10));
const scoresOfBooks = inputData
  .shift()
  .split(" ")
  .map(v => parseInt(v, 10));

const calculateScore = (libID, libraryInfo, libraryBooks) => {
  const books = libraryBooks
    .split(" ")
    .map(book => parseInt(book, 10))
    .sort((a, b) => scoresOfBooks[b] - scoresOfBooks[a]);
  const [numBooks, signupDays, numBooksScannedPerDay] = libraryInfo
    .split(" ")
    .map(v => parseInt(v, 10));
  const totalScore = books.reduce((accumulated, current) => {
    return accumulated + scoresOfBooks[current];
  }, 0);

  const totalDaysToScan = numBooks / numBooksScannedPerDay;
  const librayScore = totalScore / (totalDaysToScan + signupDays);
  return { libID, librayScore, numBooks, books, signupDays };
};

const scoredLibraries = [];
for (let i = 0; i < inputData.length; i += 2) {
  scoredLibraries.push(calculateScore(i / 2, inputData[i], inputData[i + 1]));
}

const sortedLibraries = scoredLibraries.sort((a, b) => {
  if (b.librayScore === a.librayScore) {
    return a.signupDays - b.signupDays;
  } else {
    return b.librayScore - a.librayScore;
  }
});

let finalData = sortedLibraries.length + "\n";

for (let j = 0; j < sortedLibraries.length; j++) {
  const { libID, numBooks, books } = sortedLibraries[j];
  finalData = finalData + libID + " " + numBooks + "\n";
  finalData = finalData + books.join(" ") + "\n";
}

const outputFilename = filename.split(".txt")[0] + "_output.txt";
fs.writeFileSync(outputFilename, finalData);
