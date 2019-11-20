import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ElementDict = { [key: string]: HTMLElement };

const stripNull = (elements: ElementDict) =>
  Object.entries(elements).reduce((accum, [key, element]) => {
    if (!element) return accum;
    return Object.assign(accum, { [key]: element });
  }, {});

type Props = {
  children: React.ReactElement[];
  className?: string;
  childClassName?: string;
  childElement?: string;
  element?: string;
};

const TinyFlip: React.FunctionComponent<Props> = ({
  children,
  className,
  childClassName,
  childElement,
  element
}) => {
  const elements: React.MutableRefObject<ElementDict> = React.useRef({});
  const positions = React.useRef({});
  const raf: React.MutableRefObject<number> = React.useRef();

  useIsomorphicLayoutEffect(() => {
    cancelAnimationFrame(raf.current);
    elements.current = stripNull(elements.current);

    Object.entries(elements.current).forEach(([key, element]) => {
      // If the element is 'null' it has unmounted
      if (!element) return;

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

      raf.current = requestAnimationFrame(() => {
        element.style.transition = "transform 0.5s ease-out";
        element.style.transform = "translate(0, 0) scale(1)";
        setTimeout(() => (element.style.transition = "none"), 500);
      });
    });
  }, [children]);

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

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
