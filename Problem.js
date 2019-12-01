module.exports = function Problem({ input, solve }) {
  return {
    async run() {
      await Promise.resolve()
        .then(input)
        .then(solve)
        .then(console.log);
    }
  };
};
