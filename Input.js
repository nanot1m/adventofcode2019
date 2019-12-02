module.exports = {
  day(dayN) {
    return require("fs")
      .readFileSync(`day${dayN}.input.txt`, "utf8")
      .trim();
  }
};
