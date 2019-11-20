import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const isSameChildren = (oldChildren, newChildren) =>
  oldChildren.every((child, index) => child.key === newChildren[index].key);

type ElementDict = { [key: string]: HTMLElement };
const measureElements = (elements: ElementDict) =>
  Object.entries(elements).reduce((accum, [key, element]) => {
    const rect = element.getBoundingClientRect();
    return Object.assign(accum, { [key]: rect });
  }, {});

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
  const [childs, setChilds] = React.useState(children);
  const elements: React.MutableRefObject<ElementDict> = React.useRef({});
  const positions = React.useRef({});
  const raf: React.MutableRefObject<number> = React.useRef();

  const shouldTransition = React.useRef(false);

  React.useEffect(() => {
    elements.current = stripNull(elements.current);
    if (
      children.length !== childs.length ||
      !isSameChildren(childs, children)
    ) {
      positions.current = measureElements(elements.current);
      shouldTransition.current = true;
      setChilds(children);
    } else {
      setChilds(children);
    }
  }, [children]);

  useIsomorphicLayoutEffect(() => {
    if (shouldTransition.current) {
      shouldTransition.current = false;
      cancelAnimationFrame(raf.current);

      Object.entries(elements.current).forEach(([key, element]) => {
        const oldPos = positions.current[key];

        // If the element is 'null' it has unmounted
        if (!element) return;

        if (oldPos) {
          const newPos = element.getBoundingClientRect();
          const xDiff = newPos.left - oldPos.left;
          const yDiff = newPos.top - oldPos.top;

          element.style.transform = `translate(${-xDiff}px, ${-yDiff}px) scale(1)`;
        } else {
          // If the element has no old position it is new since last render
          element.style.transform = "scale(0.1)";
        }

        raf.current = requestAnimationFrame(() => {
          element.style.transition = "transform 0.5s ease-out";
          element.style.transform = "translate(0, 0) scale(1)";
          setTimeout(() => (element.style.transition = "none"), 500);
        });
      });
    }
  });

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return React.createElement(
    element || "div",
    { className },
    React.Children.map(childs, child =>
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
