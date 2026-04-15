'use client'

import { useEffect, useMemo, useState } from 'react'
import useAmbientMusic from './components/useAmbientMusic'

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

export default function HomePage () {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [milkQuantity, setMilkQuantity] = useState('')
  const [statusMessage, setStatusMessage] = useState(
    'Ready to begin your next milking session.'
  )
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  const sessionIsActive = isRunning && !isPaused

  const ensureAudioReady = useAmbientMusic(sessionIsActive)

  useEffect(() => {
    if (!isRunning || isPaused) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds(seconds => seconds + 1)
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [isRunning, isPaused])

  const handleStart = async () => {
    await ensureAudioReady()
    setSessionStart(new Date())
    setElapsedSeconds(0)
    setIsRunning(true)
    setIsPaused(false)
    setShowSaveForm(false)
    setSaveError('')
    setSaveSuccess('')
    setStatusMessage('Milking session in progress - calming music is playing.')
  }

  const handlePauseResume = async () => {
    if (!isRunning) return

    if (isPaused) {
      await ensureAudioReady()
    }

    setIsPaused(paused => {
      const next = !paused
      setStatusMessage(
        next ? 'Session paused.' : 'Session resumed with music playing.'
      )
      return next
    })
  }

  const handleStop = () => {
    if (!isRunning) return
    setIsRunning(false)
    setIsPaused(false)
    setShowSaveForm(true)
    setStatusMessage(
      'Session stopped. Save the milk quantity to record the session.'
    )
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const handleSave = async () => {
    setSaveError('')
    setSaveSuccess('')

    const qty = Number.parseFloat(milkQuantity)
    if (Number.isNaN(qty) || qty < 0) {
      setSaveError('Enter a valid milk quantity in liters.')
      return
    }

    const now = new Date()
    const sessionData = {
      start_time: sessionStart?.toISOString() || now.toISOString(),
      end_time: now.toISOString(),
      duration: elapsedSeconds,
      milk_quantity: qty
    }

    try {
      const response = await fetch(`${backendUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      const body: { data?: { id: string }; error?: { message?: string } } =
        await response.json()
      if (!response.ok) {
        throw new Error(body.error?.message || 'Unable to save the session')
      }

      setSaveSuccess('Sessions added')
      setShowSaveForm(false)
      setMilkQuantity('')
      setStatusMessage(
        'Session recorded. View history to check past milking data.'
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save session.'
      setSaveError(message)
    }
  }

  const statusLabel = useMemo(() => {
    if (sessionIsActive) return 'ON'
    if (isPaused) return 'PAUSE'
    return 'READY'
  }, [sessionIsActive, isPaused])

  return (
    <main className='container'>
      <div className='page-card'>
        <div className='header-row'>
          <div className='hero-copy'>
            <span className='eyebrow'>MILK TIME</span>
            <h1 className='hero-title'>Milk Track</h1>
            <div className='hero-stats'>
              <div className='mini-stat'>
                <span className='mini-stat-icon'>OO</span>
                <span className='mini-stat-value'>{statusLabel}</span>
                <span className='mini-stat-label'>State</span>
              </div>
              <div className='mini-stat'>
                <span className='mini-stat-icon'>00</span>
                <span className='mini-stat-value'>
                  {formatSeconds(elapsedSeconds)}
                </span>
                <span className='mini-stat-label'>Timer</span>
              </div>
            </div>
          </div>
          <a href='/history' className='secondary-button'>
            History
          </a>
        </div>

        <section className='feature-grid'>
          <div className='timer-panel'>
            <div className='status-chip'>{statusLabel}</div>
            <p className='timer-value'>{formatSeconds(elapsedSeconds)}</p>
            <p className='timer-label'>Time</p>
            <div className='controls'>
              {!isRunning && !showSaveForm && (
                <button
                  className='primary-button action-button'
                  onClick={handleStart}
                >
                  <span>Start</span>
                </button>
              )}
              {isRunning && (
                <>
                  <button
                    className='secondary-button action-button'
                    onClick={handlePauseResume}
                  >
                    <span>{isPaused ? 'Go' : 'Pause'}</span>
                  </button>
                  <button
                    className='danger-button action-button'
                    onClick={handleStop}
                  >
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <div className='status-banner'>
          <span className='status-banner-label'>NOW</span>
          <p>{statusMessage}</p>
        </div>

        {saveSuccess && <p className='alert alert-success'>{saveSuccess}</p>}

        {showSaveForm && (
          <div className='input-card'>
            <h2>Milk</h2>
            <p>Liters</p>
            <div className='input-row'>
              <input
                type='number'
                min='0'
                step='0.1'
                placeholder='0.0'
                value={milkQuantity}
                onChange={event => setMilkQuantity(event.target.value)}
              />
              <button
                className='primary-button action-button'
                onClick={handleSave}
              >
                <span className='action-symbol'>+</span>
                <span>Save</span>
              </button>
            </div>
            {saveError && <p className='alert alert-error'>{saveError}</p>}
          </div>
        )}

        <section className='insight-grid compact-grid'>
          <div className='compact-card'>
            <span className='compact-icon'>COW</span>
            <span className='compact-label'>शांत</span>
            <span className='compact-note'>गाय आराम में</span>
          </div>
          <div className='compact-card'>
            <span className='compact-icon'>MILK</span>
            <span className='compact-label'>रिकॉर्ड</span>
            <span className='compact-note'>दूध दर्ज करें</span>
          </div>
          <div className='compact-card'>
            <span className='compact-icon'>TIME</span>
            <span className='compact-label'>समय</span>
            <span className='compact-note'>हर सत्र का समय</span>
          </div>
        </section>
      </div>
    </main>
  )
}
