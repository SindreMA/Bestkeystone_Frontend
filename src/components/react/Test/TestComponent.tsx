import React, { useEffect } from 'react'

interface IProps {
  testValue: string
  fetchSpecData: () => void
  specData: any
}

const TestComponent = (props: IProps) => {

  console.log("Render from REACTcomponent ", props.specData);

  useEffect(() => {
    console.log("First mount", props);

    props.fetchSpecData()

  }, [])


  return (
    <div className='text-white'>TestComponent, with value: {props.testValue}, {JSON.stringify(props.specData)}</div>
  )
}

export default TestComponent
