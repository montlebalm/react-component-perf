import React from 'react';
import ReactDOM from 'react-dom';

// ----------------------------------------
// Helpers
// ----------------------------------------

const toDecimal = (num, decimals) => parseFloat(num.toFixed(decimals));

// ----------------------------------------
// Components
// ----------------------------------------

class ExampleComponent extends React.Component {
  render() {
    return <div>Component: stateful</div>;
  }
}

class ExamplePureComponent extends React.PureComponent {
  render() {
    return <div>Component: stateful, pure, no updates</div>;
  }
}

const ExampleStateless = () => <div>Component: stateless</div>;

const ExamplePureStateless = React.memo(() => (
  <div>Component: pure stateless</div>
));

// ----------------------------------------
// Runner
// ----------------------------------------

const setup = (components, timings) => {
  const main = document.getElementById('main');

  components.forEach(component => {
    // Initial timing
    timings[component.name] = timings[component.name] || 0;

    // Create a node for each component to render into
    const node = document.createElement('div');
    node.id = component.name;
    main.appendChild(node);
  });
};

const testComponents = (components, timings) => {
  for (let i = 0; i < ITERATIONS; i++) {
    components.forEach(component => {
      const startTime = performance.now();

      ReactDOM.render(
        React.createElement(component.element),
        document.getElementById(component.name),
      );

      timings[component.name] += performance.now() - startTime;
    });
  }
};

const cleanup = (components, timings) => {
  // Put into an array
  const sorted = [];
  components.forEach(component => {
    sorted.push({
      name: component.name,
      total: timings[component.name],
    });

    // Delete the key so we can add it back in the sorted order
    delete timings[component.name];
  });

  // Sort by ascending duration
  sorted.sort((a, b) => a.total - b.total);

  const firstTotal = sorted[0].total;
  const firstAverage = sorted[0].total / ITERATIONS;

  // Add keys back in order
  sorted.forEach(({name, total}, i) => {
    const difference = total - firstTotal;
    const average = total / ITERATIONS;

    timings[name] = {
      'total ms': Math.round(total),
      'total + ms': Math.round(difference),
      'average ms': toDecimal(average, 4),
      'average + ms': toDecimal(average - firstAverage, 4),
      '% slower': toDecimal(difference / firstTotal, 2) * 100,
    };
  });
};

// ----------------------------------------
// Main
// ----------------------------------------

const ITERATIONS = 100000;
const components = [
  {name: 'Component', element: ExampleComponent},
  {name: 'Component (pure)', element: ExamplePureComponent},
  {name: 'Stateless', element: ExampleStateless},
  {name: 'Stateless (pure)', element: ExamplePureStateless},
];
const timings = {};

console.log(`Starting ${ITERATIONS} tests %c`, 'font-weight: bold');

setup(components, timings);
testComponents(components, timings);
testComponents(components.slice().reverse(), timings);
cleanup(components, timings);

console.table(timings);
