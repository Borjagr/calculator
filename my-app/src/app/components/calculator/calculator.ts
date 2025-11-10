import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calculator',
  imports: [],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
})
export class Calculator implements OnInit {
  display: string = '';
  lastWasResult: boolean = false;
  isDark: boolean = false;
  displayUpdated: boolean = false;

  ngOnInit() {
    try {
      const saved = localStorage.getItem('calculatorTheme');
      this.isDark = saved === 'dark';
    } catch {
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    try {
      localStorage.setItem('calculatorTheme', this.isDark ? 'dark' : 'light');
    } catch {
    }
  }

  speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.2;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  }

  pressKey(key: string) {
    const isDigitOrDot = /^[0-9.]$/.test(key);

    if (this.lastWasResult && isDigitOrDot) {
      this.display = key;
      this.lastWasResult = false;
      this.triggerDisplayAnimation();
      return;
    }

    if (key === 'C') {
      this.display = '';
      this.lastWasResult = false;
    } else if (key === '=') {
      try {
        this.display = this.evaluateExpression(this.display);
        this.speak('El resultado es ' + this.display);
        this.triggerDisplayAnimation();
      } catch {
        this.display = 'Error';
        this.speak('Error');
        this.triggerDisplayAnimation();
      }
      this.lastWasResult = true;
    } else {
      if (this.display.length < 15) {
        const lastChar = this.display[this.display.length - 1];
        const isOperator = /[+\-*/]/.test(key);
        const isLastOperator = /[+\-*/]/.test(lastChar);
        
        if (key === '.') {
          const parts = this.display.split(/[+\-*/]/);
          const currentNumber = parts[parts.length - 1];
          if (!currentNumber.includes('.')) {
            this.display += key;
            this.triggerDisplayAnimation();
          }
        } else if (isOperator && !isLastOperator && this.display.length > 0) {
          this.display += key;
          this.triggerDisplayAnimation();
        } else if (!isOperator) {
          this.display += key;
          this.triggerDisplayAnimation();
        }
      }
      this.lastWasResult = false;
    }
  }

  private triggerDisplayAnimation() {
    this.displayUpdated = true;
    setTimeout(() => {
      this.displayUpdated = false;
    }, 300);
  }

  private evaluateExpression(expr: string): string {
    if (!/^[0-9+\-*/.() ]+$/.test(expr)) {
      throw new Error('Invalid expression');
    }
    
    const result = Function('"use strict"; return (' + expr + ')')();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    return result.toString();
  }

  clearAll() {
    this.display = '';
    this.lastWasResult = false;
    this.triggerDisplayAnimation();
  }

  backspace() {
    if (this.lastWasResult) {
      this.display = '';
      this.lastWasResult = false;
      this.triggerDisplayAnimation();
      return;
    }
    this.display = this.display.slice(0, -1);
    this.triggerDisplayAnimation();
  }
}
