import React from 'react'

interface IProps {
  testValue: string
}

const TestComponent = (props: IProps) => {
  return (
    <div className='text-white'>TestComponent, with value: {props.testValue}</div>
  )
}

export default TestComponent
