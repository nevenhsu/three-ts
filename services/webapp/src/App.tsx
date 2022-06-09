import { useState, useEffect, useRef } from 'react'
import { useOnWindowResize } from 'rooks'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import StatsModule from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import type { MeshProps } from '@react-three/fiber'
import './App.scss'

const gui = new GUI()
const stats = getStats()

function Box(props: MeshProps) {
    // This reference will give us direct access to the mesh
    const mesh = useRef<THREE.Mesh>(null)
    const [folder, isNew] = useGuiFolder('Box')

    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)

    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += 0.01
            mesh.current.rotation.y += 0.01
        }
    })

    useEffect(() => {
        if (mesh.current && isNew) {
            folder.add(mesh.current.rotation, 'x', 0, Math.PI * 2)
            folder.add(mesh.current.rotation, 'y', 0, Math.PI * 2)
            folder.add(mesh.current.rotation, 'z', 0, Math.PI * 2)
            folder.open()
        }
    }, [mesh.current])

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
    const [folder, isNew] = useGuiFolder('Camera')

    useEffect(() => {
        const controls = new OrbitControls(camera, gl.domElement)
        controls.minDistance = 2
        controls.maxDistance = 20
        camera.position.z = 5

        return () => {
            controls.dispose()
        }
    }, [camera, gl])

    useEffect(() => {
        if (camera && isNew) {
            folder.add(camera.position, 'z', 2, 20)
        }
    }, [camera])

    return null
}

function Scene() {
    const { gl, scene } = useThree()

    useEffect(() => {
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
    const id = 'Stats'
    const stats = StatsModule()

    const node = document.getElementById(id)
    if (node) {
        node.remove()
    }

    const newNode = document.createElement('div')
    newNode.id = id
    newNode.appendChild(stats.dom)
    document.body.appendChild(newNode)

    return stats
}

function useGuiFolder(name: string): [GUI, boolean] {
    resetGUI()

    const ref = useRef<GUI | null>(null)

    if (ref.current) {
        return [ref.current, false]
    }

    const folder = gui.addFolder(name)
    ref.current = folder
    return [folder, true]
}

function resetGUI() {
    const nodes = document.getElementsByClassName(
        'dg ac'
    ) as HTMLCollectionOf<HTMLDivElement>
    const node = nodes[0]

    if (node) {
        const childNodes = Array.from(node.childNodes)
        childNodes.forEach((val, i) => {
            console.log(val, i, i !== 0)
            if (i !== 0) {
                val.remove()
            }
        })
    }
}
