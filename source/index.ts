import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ElementDict = { [key: string]: HTMLElement };

const stripNull = (elements: ElementDict) =>
  Object.entries(elements).reduce((accum, [key, element]) => {
    if (!element) return accum;
    return Object.assign(accum, { [key]: element });
  }, {});

const transitionString = (duration, easing) =>
  `transform ${duration / 1000}s ${easing}`;

const clearStyles = element => {
  element.style.transform = "";
  element.style.transition = "";
};

type Props = {
  children: React.ReactElement[];
  className?: string;
  childClassName?: string;
  childElement?: string;
  duration?: number;
  easing?: string;
  element?: string;
};

const TinyFlip: React.FunctionComponent<Props> = ({
  children,
  className,
  childClassName,
  childElement,
  duration,
  easing,
  element
}) => {
  const elements: React.MutableRefObject<ElementDict> = React.useRef({});
  const positions = React.useRef({});
  const raf: React.MutableRefObject<number> = React.useRef();
  const timer: React.MutableRefObject<any> = React.useRef();

  useIsomorphicLayoutEffect(() => {
    cancelAnimationFrame(raf.current);
    clearTimeout(timer.current);
    elements.current = stripNull(elements.current);

    Object.entries(elements.current).forEach(([key, element]) => {
      clearStyles(element);

      const oldPos = positions.current[key];
      const newPos = element.getBoundingClientRect();

      if (oldPos) {
        const xDiff = newPos.left - oldPos.left;
        const yDiff = newPos.top - oldPos.top;

        element.style.transform = `translate(${-xDiff}px, ${-yDiff}px) scale(1)`;
      } else {
        // If the element has no old position it is new since last render
        element.style.transform = "scale(0.1)";
      }

      positions.current[key] = newPos;

      const dur = duration || 500;
      const ease = easing || "cubic-bezier(0.3,0,0,1)";

      raf.current = requestAnimationFrame(() => {
        element.style.transition = transitionString(dur, ease);
        element.style.transform = "translate(0, 0) scale(1)";

        timer.current = setTimeout(() => clearStyles(element), dur);
      });
    });
  }, [children]);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(timer.current);
    },
    []
  );

  return React.createElement(
    element || "div",
    { className },
    React.Children.map(children, child =>
      React.createElement(
        childElement || "div",
        {
          className: childClassName,
          ref: el => (elements.current[child.key] = el)
        },
        child
      )
    )
  );
};

export default TinyFlip;
