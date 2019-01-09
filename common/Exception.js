export default function Exception(name, message, action) {
  this.message = message;
  this.name = name;
  this.action = action;
}
