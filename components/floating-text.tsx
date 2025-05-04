"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"

interface FloatingTextProps {
  text: string
  size?: number
  height?: number
  color?: string
  position?: [number, number, number]
}

export default function FloatingText({
  text,
  size = 0.5,
  height = 0.2,
  color = "#ffffff",
  position = [0, 0, 0],
}: FloatingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // Load font and create text
    const fontLoader = new FontLoader()

    // Use a default font path - in a real app, you'd need to provide this font
    fontLoader.load("/fonts/helvetiker_bold.typeface.json", (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: height,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      })

      textGeometry.center()

      const textMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2,
      })

      const textMesh = new THREE.Mesh(textGeometry, textMaterial)
      textMesh.position.set(position[0], position[1], position[2])
      scene.add(textMesh)

      // Animation
      const animate = () => {
        requestAnimationFrame(animate)

        // Floating animation
        textMesh.rotation.y += 0.005
        textMesh.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.1

        renderer.render(scene, camera)
      }

      animate()
    })

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }

      scene.clear()
    }
  }, [text, size, height, color, position])

  return <div ref={containerRef} className="h-full w-full" />
}

