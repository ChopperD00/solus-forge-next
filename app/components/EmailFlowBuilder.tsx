'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NodeWorkflowCanvas, { WorkflowNode, NodeConnection } from './NodeWorkflowCanvas'

// Brand-aligned color palette
const colors = {
  bg: '#0A0A0F',
  surface: '#12121A',
  surfaceLight: '#1A1A24',
  border: '#2A2A3A',
  text: '#FFFFFF',
  textDim: '#888899',
  textMuted: '#666677',
  email: '#7C3AED',
  trigger: '#10B981',
  condition: '#F59E0B',
  action: '#3B82F6',
  delay: '#8B5CF6',
  gold: '#D4AF37',
  gradient: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #10B981 100%)',
}

// Email flow node types
const triggerNodes = [
  { id: 'list_subscribe', name: 'List Subscribe', icon: '📥', description: 'When someone joins a list' },
  { id: 'tag_added', name: 'Tag Added', icon: '🏷️', description: 'When a tag is applied' },
  { id: 'purchase', name: 'Purchase Made', icon: '🛒', description: 'After a purchase' },
  { id: 'form_submit', name: 'Form Submitted', icon: '📝', description: 'Form submission trigger' },
  { id: 'link_click', name: 'Link Clicked', icon: '🔗', description: 'Email link clicked' },
  { id: 'date_based', name: 'Date/Anniversary', icon: '📅', description: 'Date-based trigger' },
]

const conditionNodes = [
  { id: 'email_opened', name: 'Email Opened?', icon: '👁️', description: 'Check if opened' },
  { id: 'link_clicked', name: 'Link Clicked?', icon: '🔗', description: 'Check if clicked' },
  { id: 'has_tag', name: 'Has Tag?', icon: '🏷️', description: 'Check for tag' },
  { id: 'purchased', name: 'Made Purchase?', icon: '💰', description: 'Check purchase history' },
  { id: 'ab_split', name: 'A/B Split', icon: '⚡', description: 'Random split test' },
  { id: 'time_based', name: 'Time of Day', icon: '⏰', description: 'Check current time' },
]

const actionNodes = [
  { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send an email' },
  { id: 'add_tag', name: 'Add Tag', icon: '🏷️', description: 'Apply a tag' },
  { id: 'remove_tag', name: 'Remove Tag', icon: '❌', description: 'Remove a tag' },
  { id: 'subscribe_list', name: 'Add to List', icon: '📋', description: 'Subscribe to list' },
  { id: 'notify_team', name: 'Notify Team', icon: '🔔', description: 'Send notification' },
  { id: 'webhook', name: 'Webhook', icon: '🌐', description: 'Call external API' },
]

const flowNodes = [
  { id: 'delay', name: 'Wait/Delay', icon: '⏳', description: 'Wait before continuing' },
  { id: 'goal_check', name: 'Goal Check', icon: '🎯', description: 'Exit if goal met' },
  { id: 'end', name: 'End Flow', icon: '🏁', description: 'End automation' },
]

export default function EmailFlowBuilder() {
  return (
    <div className="relative w-full h-[700px] rounded-2xl overflow-hidden" style={{ border: '1px solid #2A2A3A' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <div className="text-xl font-medium text-white">Email Flow Builder</div>
          <div className="text-sm text-gray-400 mt-2">Visual automation editor</div>
        </div>
      </div>
    </div>
  )
}
