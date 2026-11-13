'use client'

import React from 'react'

interface TaskCheckboxProps {
  done: boolean
  color?: string
  onToggle: () => void
  label?: string
}

export function TaskCheckbox({ done, color = '#E0A030', onToggle, label }: TaskCheckboxProps) {
  const accentColor = color || '#E0A030'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      aria-pressed={done}
      aria-label={label || (done ? 'Mark task as incomplete' : 'Mark task as complete')}
      title={done ? 'Completed (click to uncheck)' : 'Pending (click to complete)'}
      style={{
        width: '24px',
        height: '24px',
        minWidth: '24px',
        minHeight: '24px',
        maxWidth: '24px',
        maxHeight: '24px',
        borderRadius: '50%',
        border: `2.2px solid ${accentColor}`,
        backgroundColor: done ? accentColor : 'rgba(255, 255, 255, 0.08)',
        boxShadow: done
          ? `0 0 8px ${accentColor}88, inset 0 0 4px rgba(255,255,255,0.3)`
          : `0 0 0 1px rgba(0,0,0,0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        padding: 0,
        margin: '0 4px 0 0',
        transition: 'transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {done ? (
        <svg
          viewBox="0 0 14 14"
          width="13"
          height="13"
          style={{
            stroke: '#ffffff',
            strokeWidth: 3,
            fill: 'none',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            display: 'block',
          }}
        >
          <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
        </svg>
      ) : (
        /* Unchecked inner indicator dot so the checkbox is unmistakably visible */
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: `${accentColor}88`,
            display: 'block',
          }}
        />
      )}
    </button>
  )
}
