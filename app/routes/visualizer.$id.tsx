import React from 'react'
import { useParams } from 'react-router'

const VisualizerId = () => {
    const { id } = useParams()
    return (
        <div>
            Visualizer {id}
        </div>
    )
}

export default VisualizerId
