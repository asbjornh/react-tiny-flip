import * as React from "react";

import TinyFlip from "../source/index";

const Index = () => {
  const [list, setList] = React.useState(["a", "b", "c", "d"]);

  const toggle = () => setList(list => ["e", ...list]);

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      <TinyFlip className="flip" childClassName="flip-child">
        {list.map(el => (
          <div key={el}>{el}</div>
        ))}
      </TinyFlip>
    </div>
  );
};

Index.propTypes = {};

export default Index;
