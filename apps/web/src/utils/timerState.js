export const timerState = {
  isRunning: false,
  listeners: new Set(),
  
  setIsRunning(running) {
    this.isRunning = running;
    this.listeners.forEach(listener => listener(this.isRunning));
  },
  
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.isRunning);
    return () => this.listeners.delete(listener);
  }
};
