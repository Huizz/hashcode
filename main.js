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

  // @TODO: assuming that scanning of books for each library are independent of each other
  // what is the score I scan if I signup + scan until end of totalTime?
  let sortBooksWithScore = books.map(book => {
    return { bookID: book, score: scoresOfBooks[book] };
  });
  sortBooksWithScore = sortBooksWithScore.sort((a, b) => b.score - a.score);
  let totalScoreTwo = 0;
  const numDaysCanScan = totalTime - signupDays;

  const upperLimit =
    books.length < numDaysCanScan * numBooksScannedPerDay
      ? books.length
      : numDaysCanScan * numBooksScannedPerDay;
  // so let's say I can scan up to 5 days, and I can scan 2 books a day, I can scan up till 10 books in 5 days
  // I want to get the total score I can get if I scan for number of days up till upperLimit
  for (let i = 0; i < upperLimit; i++) {
    totalScoreTwo += sortBooksWithScore[i].score;
  }

  const totalDaysToScan = books.length / numBooksScannedPerDay;
  // const librayScore = totalScore / (totalDaysToScan + signupDays);
  const librayScore = totalScoreTwo / signupDays;
  // how much score can I scan per day vs how long I need to scan everything
  // totalScore/totalDaysToScan / (signupDays + totalDaysToScan)
  // const librayScore = totalScore / totalDaysToScan / (signupDays / totalTime);
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
