module.exports = {
  day(dayN) {
    const name = require("path").join(
      __dirname,
      "..",
      "input",
      `day${dayN}.input.txt`
    );
    return require("fs")
      .readFileSync(name, "utf8")
      .trim();
  }
};
