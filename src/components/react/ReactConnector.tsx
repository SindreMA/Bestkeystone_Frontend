import AllComponents from "./AllComponents";
import * as React from 'react'
import { Root, createRoot } from 'react-dom/client';

// Object with any value
type IProps = {
  [key: string]: any;
}

export default class ReactConnector {

  root: Root;
  nameOfComponent: string;
  props: IProps;

  constructor(targetEl: HTMLElement, nameOfPassedComponent: string, passedProps: IProps) {
    this.root = createRoot(targetEl);
    this.nameOfComponent = nameOfPassedComponent;
    this.props = passedProps;
  }

  render() {
    const ReactComponent = AllComponents[this.nameOfComponent]

    this.root.render(
      React.createElement(ReactComponent, {...this.props, specData: {... this.props.specData } })
    )
  }
}
