import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ElementDict = { [key: string]: HTMLElement };

const clearStyles = element => {
  element.style.transform = "";
  element.style.transition = "";
};

type Props = {
  children: React.ReactElement[];
  childElement?: string;
  childProps?: object;
  duration?: number;
  easing?: string;
  element?: string;
  elementProps?: object;
};

const TinyFlip: React.FunctionComponent<Props> = props => {
  const elements: React.MutableRefObject<ElementDict> = React.useRef({});
  const positions = React.useRef({});
  const raf: React.MutableRefObject<number> = React.useRef();
  const timer: React.MutableRefObject<any> = React.useRef();

  useIsomorphicLayoutEffect(() => {
    cancelAnimationFrame(raf.current);
    clearTimeout(timer.current);

    Object.entries(elements.current).forEach(([key, element]) => {
      if (!element) {
        delete elements.current[key];
        return;
      }

      clearStyles(element);

      const oldPos = positions.current[key];
      const newPos = element.getBoundingClientRect();

      if (oldPos) {
        const xDiff = newPos.left - oldPos.left;
        const yDiff = newPos.top - oldPos.top;

        element.style.transform = `translate(${-xDiff}px, ${-yDiff}px) scale(1)`;
      } else {
        // If the element has no old position it is new since last render
        element.style.transform = "translate(0, 0) scale(0.1)";
      }

      positions.current[key] = newPos;
    });

    raf.current = requestAnimationFrame(() => {
      const dur = props.duration || 500;
      const ease = props.easing || "cubic-bezier(0.3,0,0,1)";
      Object.values(elements.current).forEach(element => {
        element.style.transition = `transform ${dur / 1000}s ${ease}`;
        element.style.transform = "translate(0, 0) scale(1)";
      });

      timer.current = setTimeout(() => {
        Object.values(elements.current).forEach(clearStyles);
      }, dur);
    });
  }, [props.children, props.duration, props.easing]);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(timer.current);
    },
    []
  );

  return React.createElement(
    props.element || "div",
    props.elementProps,
    React.Children.map(props.children, child =>
      React.createElement(
        props.childElement || "div",
        Object.assign({}, props.childProps, {
          ref: el => (elements.current[child.key] = el)
        }),
        child
      )
    )
  );
};

export default TinyFlip;
