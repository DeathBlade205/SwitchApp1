import { Component } from 'react'

// Wraps WebGL / 3D children so a runtime failure renders the fallback
// instead of unmounting the whole React tree (blank page).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    console.warn('ErrorBoundary caught:', err)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
