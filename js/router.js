/* HabitFlow SPA Client Router with Auth Guard */

import { stateManager } from './state.js';

export class Router {
  constructor(routesMap) {
    this.routes = routesMap;
    this.currentRoute = 'dashboard';
    this.listeners = [];
  }

  init() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  }

  handleHashChange() {
    let hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash || !this.routes[hash]) {
      hash = 'dashboard';
    }
    this.navigate(hash, false);
  }

  navigate(routeName, updateHash = true) {
    if (!this.routes[routeName]) routeName = 'dashboard';
    this.currentRoute = routeName;

    if (updateHash) {
      window.location.hash = `#/${routeName}`;
    }

    const renderFn = this.routes[routeName];
    if (typeof renderFn === 'function') {
      renderFn();
    }

    this.notify(routeName);
  }

  onRouteChanged(fn) {
    this.listeners.push(fn);
  }

  notify(route) {
    this.listeners.forEach(fn => fn(route));
  }
}
