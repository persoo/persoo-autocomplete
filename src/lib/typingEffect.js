export default class TypingEffectManager {
    constructor(inputSelector, placeholdersToRotate, periodInMs) {
        this.inputSelector = inputSelector;
        this.placeholdersToRotate = placeholdersToRotate;
        if (placeholdersToRotate && !Array.isArray(placeholdersToRotate)) {
            console.warn("PersooAutocompleteInput: placeholder to rotate are not array of strings");
        }
        this.period = (typeof(periodInMs) == 'string' ? parseInt(periodInMs, 10) : periodInMs ) || 4000;
        this.inputElement = document.querySelector(this.inputSelector);
        if (!this.inputElement) {
            console.warn("PersooAutocompleteInput: cannot find input element" +
                        ` with selector '{$this.inputElementSelector}'.`);
        }
        this.txt = '';
        this.loopNum = 0;
        this.isDeleting = false;
        this.destroyed = false;
        this.tick();
    }

    tick() {
      let i = this.loopNum % this.placeholdersToRotate.length;
      let fullTxt = this.placeholdersToRotate[i];

      if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
      } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
      }

      this.inputElement.placeholder = this.txt;

      const that = this;
      let delta = 200 - Math.random() * 100;

      if (this.isDeleting) {
        delta /= 2;
      }

      if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
      }

      setTimeout(function() {
          if (!that || !that.destroyed) {
              that.tick();
          }
      }, delta);
    }

    destroy() {
        this.destroyed = true;
    }
}
