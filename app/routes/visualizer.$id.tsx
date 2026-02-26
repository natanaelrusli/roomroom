import { useLocation, useParams } from 'react-router'
import { useState, useEffect } from 'react'

const VisualizerId = () => {
    const { id } = useParams()
    const location = useLocation()
    const { initialImage, name: stateName } = location.state || {}

    // Defer location.state until after mount so server and first client paint match (avoid hydration mismatch)
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const name = mounted ? (stateName ?? undefined) : undefined
    const initialImageAfterMount = mounted ? initialImage : undefined

    return (
        <section>
            <h1>{name ?? 'Untitled Project'}</h1>
            <div className='visualizer'>
                {initialImageAfterMount && (
                    <div className='image-container'>
                        <h2>Source Image</h2>
                        <img src={initialImageAfterMount} alt='source' />
                    </div>
                )}
            </div>
            Visualizer {id}
        </section>
    )
}

export default VisualizerId
