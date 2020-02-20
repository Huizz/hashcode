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

const calculateScore = library => {
  const { books, numBooks, numBooksScannedPerDay, signupDays } = library;
  const totalScore = books.reduce((accumulated, current) => {
    return accumulated + scoresOfBooks[current];
  }, 0);

  const totalDaysToScan = books.length / numBooksScannedPerDay;
  const librayScore = totalScore / (totalDaysToScan + signupDays);
  library.librayScore = librayScore;

  return library;
};

const scoredLibraries = [];
for (let i = 0; i < inputData.length; i += 2) {
  const books = inputData[i + 1]
    .split(" ")
    .map(book => parseInt(book, 10))
    .sort((a, b) => scoresOfBooks[b] - scoresOfBooks[a]);
  const [numBooks, signupDays, numBooksScannedPerDay] = inputData[i]
    .split(" ")
    .map(v => parseInt(v, 10));
  const library = {
    libID: i / 2,
    librayScore: null,
    numBooks,
    numBooksScannedPerDay,
    books,
    signupDays
  };
  scoredLibraries.push(calculateScore(library));
}

let sortedLibraries = scoredLibraries.sort((a, b) => {
  return b.librayScore - a.librayScore;
});

const alreadyScannedMap = {};

for (let k = 0; k < sortedLibraries.length; k++) {
  // remove books that has alr been considered for scanning
  const { libID, librayScore, numBooks, books, signupDays } = sortedLibraries[
    k
  ];
  let finalBooksArray = [];
  for (const book of books) {
    if (alreadyScannedMap[book] == null) {
      finalBooksArray.push(book);
      alreadyScannedMap[book] = true;
    }
  }
  sortedLibraries[k].books = finalBooksArray;
}

sortedLibraries = sortedLibraries.filter(l => l.books.length > 0);

const rescoredLibraries = [];
for (let i = 0; i < sortedLibraries.length; i++) {
  rescoredLibraries.push(calculateScore(sortedLibraries[i]));
}

const resortedLibraries = rescoredLibraries.sort(
  (a, b) => b.librayScore - a.librayScore
);

let finalData = resortedLibraries.length + "\n";
const finalDataArray = [];

for (let j = 0; j < resortedLibraries.length; j++) {
  const { libID, books } = resortedLibraries[j];

  finalDataArray.push(libID + " " + books.length);
  finalDataArray.push(books.join(" "));
}

finalData = finalData + finalDataArray.join("\n");

const outputFilename = filename.split(".txt")[0] + "_output.txt";
fs.writeFileSync(outputFilename, finalData);
