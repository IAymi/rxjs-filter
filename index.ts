// Import stylesheets
import './style.css';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

// setting for look like rxjs
console.clear();

interface Observer {
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
}

type TearDown = () => void;

type OperatorFunction = (source: Observable) => Observable;

class Subscription {
  teardownList: TearDown[] = [];
  constructor(teardown?: TearDown) {
    if (teardown) {
      this.teardownList.push(teardown);
    }
  }

  add(subscription: Subscription) {
    this.teardownList.push(() => subscription.unsubscribe());
  }

  unsubscribe() {
    this.teardownList.forEach((teardown) => teardown());
    this.teardownList = [];
  }
}

class Observable {
  pipe(this: Observable, ...operators: OperatorFunction[]) {
    let source = this;
    operators.forEach((operator) => {
      source = operator(source);
    });
    return source;
  }

  subscriber: (observer: Observer) => TearDown;
  constructor(subscriber: (observer: Observer) => TearDown) {
    this.subscriber = subscriber;
  }

  subscribe(observer: Observer) {
    const teardown: TearDown = this.subscriber(observer);
    const subscription = new Subscription(teardown);
    return subscription;
  }
}

const observer: Observer = {
  next: (value: any) => console.log('observer next', value),
  error: (err: any) => console.log('observer error', err),
  complete: () => console.log('observer complete'),
};

// Start coding

import { interval, of } from 'rxjs';

function filter(predicate: (value: any) => boolean) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log('subscribe!');
      const subscription = source.subscribe({
        next: (value) => {
          const newValue = predicate(value);
          if (newValue) {
            observer.next(value);
          }
        },
        error: (err) => {
          observer.error(err);
        },
        complete: () => {
          observer.complete();
        },
      });
      return () => {
        subscription.unsubscribe();
      };
    });
}

const myInterval = interval(1000);

const subscription = myInterval
  .pipe(filter((val) => val % 2 === 0))
  .subscribe(observer);

setTimeout(() => {
  subscription.unsubscribe();
}, 5000);
