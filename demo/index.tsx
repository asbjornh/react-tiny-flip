import * as React from "react";

import TinyFlip from "../source/index";

const Index = () => {
  const [list, setList] = React.useState([
    { key: 1, value: "a" },
    { key: 2, value: "b" },
    { key: 3, value: "c" },
    { key: 4, value: "d" }
  ]);

  const add = () =>
    setList(list => {
      const i = Math.floor(Math.random() * list.length);
      return [
        ...list.slice(0, i),
        { key: new Date().getTime(), value: "e" },
        ...list.slice(i)
      ];
    });

  const remove = () =>
    setList(list => {
      const i = Math.floor(Math.random() * list.length);
      return [...list.slice(0, i), ...list.slice(i + 1)];
    });

  const shuffle = () =>
    setList(list => [...list.sort(() => (Math.random() > 0.5 ? 1 : -1))]);

  return (
    <div>
      <button onClick={add}>Add</button>
      <button onClick={remove}>Remove</button>
      <button onClick={shuffle}>Shuffle</button>
      <TinyFlip className="flip" childClassName="flip-child">
        {list.map(el => (
          <div key={el.key}>{el.value}</div>
        ))}
      </TinyFlip>
    </div>
  );
};

Index.propTypes = {};

export default Index;
