let instance = null;

export default class SpeechRecognizer {
  constructor() {
    if (!instance) {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      instance = this;
    }
    return instance;
  }

  start() {
    this.recognition.start();
  }

  stop() {
    this.recognition.abort(); // Stops and also ensures onresult event isn’t triggered
  }
}
