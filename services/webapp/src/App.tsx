import { useState, useEffect, useRef } from 'react'
import { useOnWindowResize } from 'rooks'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import StatsModule from 'three/examples/jsm/libs/stats.module'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import type { MeshProps } from '@react-three/fiber'
import './App.scss'

const stats = getStats()

function Box(props: MeshProps) {
    // This reference will give us direct access to the mesh
    const mesh = useRef<THREE.Mesh>(null)

    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)

    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += 0.01
            mesh.current.rotation.y += 0.01
        }
    })

    return (
        <mesh
            {...props}
            ref={mesh}
            onPointerOver={(event) => setHover(true)}
            onPointerOut={(event) => setHover(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="orange" wireframe />
        </mesh>
    )
}

function CameraController() {
    const { camera, gl } = useThree()

    useEffect(() => {
        const controls = new OrbitControls(camera, gl.domElement)
        controls.minDistance = 2
        controls.maxDistance = 20
        return () => {
            controls.dispose()
        }
    }, [camera, gl])

    return null
}

function Scene() {
    const { camera, gl, scene } = useThree()

    useEffect(() => {
        camera.position.z = 2
        gl.setSize(window.innerWidth, window.innerHeight)
        scene.background = new THREE.Color(0x000000)
    }, [])

    useOnWindowResize(() => {
        gl.setSize(window.innerWidth, window.innerHeight)
    })

    useFrame((state, delta) => {
        stats.update()
    })

    return (
        <>
            <CameraController />
            <ambientLight />
            <Box />
        </>
    )
}

export default function App() {
    return (
        <Canvas>
            <Scene />
        </Canvas>
    )
}

function getStats() {
    const stats = StatsModule()
    const root = document.getElementById('root') as HTMLElement
    root.appendChild(stats.dom)
    return stats
}
