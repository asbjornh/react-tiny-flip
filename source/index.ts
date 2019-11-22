import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ElementDict = { [key: string]: HTMLElement };

const clearStyles = el => {
  el.style.transform = "";
  el.style.transition = "";
};

type Props = {
  children: React.ReactElement[];
  childElement?: string;
  childProps?: object | object[];
  duration?: number;
  easing?: string;
  element?: string;
  elementProps?: object;
};

const isSame = (a, b) =>
  a.length === b.length && a.every((c, i) => c.key === b[i].key);

const TinyFlip: React.FunctionComponent<Props> = props => {
  const children = React.useRef([]);
  const elements: React.MutableRefObject<ElementDict> = React.useRef({});
  const positions = React.useRef({});
  const raf: React.MutableRefObject<number> = React.useRef();
  const timer: React.MutableRefObject<any> = React.useRef();
  const initialized = React.useRef(false);

  useIsomorphicLayoutEffect(() => {
    // NOTE: Ensures that animations are not aborted if children are unchanged
    if (isSame(children.current, props.children)) return;

    children.current = props.children;
    cancelAnimationFrame(raf.current);
    clearTimeout(timer.current);

    Object.entries(elements.current).forEach(([key, el]) => {
      if (!el) {
        delete elements.current[key];
        return;
      }

      clearStyles(el);
      const oldPos = positions.current[key];
      const newPos = el.getBoundingClientRect();

      if (oldPos) {
        const xDiff = newPos.left - oldPos.left;
        const yDiff = newPos.top - oldPos.top;

        el.style.transform = `translate(${-xDiff}px, ${-yDiff}px) scale(1)`;
      } else if (initialized.current) {
        // If the element has no old position it is new since last render
        el.style.transform = "translate(0, 0) scale(0.1)";
      }

      positions.current[key] = newPos;
    });

    initialized.current = true;
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        Object.values(elements.current).forEach(el => {
          el.style.transition = `transform ${props.duration}ms ${props.easing}`;
          el.style.transform = "translate(0, 0) scale(1)";
        });

        timer.current = setTimeout(() => {
          Object.values(elements.current).forEach(clearStyles);
        }, props.duration);
      });
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
    props.element,
    props.elementProps,
    React.Children.map(props.children, (child, index) => {
      const childProps = Array.isArray(props.childProps)
        ? props.childProps[index]
        : props.childProps;
      const ref = el => (elements.current[child.key] = el);
      return React.createElement(
        props.childElement,
        Object.assign({}, childProps, { ref }),
        child
      );
    })
  );
};

TinyFlip.defaultProps = {
  duration: 500,
  easing: "cubic-bezier(0.3,0,0,1)",
  element: "div",
  childElement: "div"
};

export default TinyFlip;
