module.exports = class Logger {
  constructor(context) {
    this.context = context;
  }

  event(type, message) {
    return this.context.log(JSON.stringify({ type, message }, null, 2))
  }
}