"use client"

import { useState } from 'react'

interface LoaderState {
    loading: boolean
    startLoading: () => void
    finishLoading: () => void
}

export function useLoading(): LoaderState {
    const [loading, setIsLoading] = useState(false)

    const startLoading = () => {
        setIsLoading(true)
    }

    const finishLoading = () => {
        setIsLoading(false)
    }

    return {
        loading,
        startLoading,
        finishLoading
    }
}