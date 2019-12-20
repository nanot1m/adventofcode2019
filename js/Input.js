module.exports = {
  day(dayN, trim = true) {
    const name = require("path").join(
      __dirname,
      "..",
      "input",
      `day${dayN}.input.txt`
    );
    let input = require("fs").readFileSync(name, "utf8");
    if (trim) input = input.trim();
    return input;
  }
};
