import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getTicketFromBranch } from './git.js'

describe('getTicketFromBranch', () => {
  // Jira-style: uppercase project key + number
  it('detects a Jira ticket in a feature branch', () => {
    assert.equal(getTicketFromBranch('feature/PROJ-123-add-oauth'), 'PROJ-123')
  })

  it('detects a short Jira key', () => {
    assert.equal(getTicketFromBranch('feature/AB-42-fix-timeout'), 'AB-42')
  })

  it('detects a long Jira key', () => {
    assert.equal(getTicketFromBranch('feature/FRONTEND-9001-refactor'), 'FRONTEND-9001')
  })

  it('detects a Jira ticket with no slug after the number', () => {
    assert.equal(getTicketFromBranch('feature/ENG-7'), 'ENG-7')
  })

  // Linear-style: lowercase key
  it('detects a lowercase Linear ticket', () => {
    assert.equal(getTicketFromBranch('feature/eng-456-add-auth'), 'ENG-456')
  })

  it('detects mixed-case Linear ticket', () => {
    assert.equal(getTicketFromBranch('fix/Proj-99-update-styles'), 'PROJ-99')
  })

  // GitHub issue number in branch
  it('detects a GitHub issue number at start of branch slug', () => {
    assert.equal(getTicketFromBranch('feature/123-add-login'), '#123')
  })

  it('detects a GitHub issue number with no description', () => {
    assert.equal(getTicketFromBranch('fix/456'), '#456')
  })

  // No ticket
  it('returns null for a plain branch name', () => {
    assert.equal(getTicketFromBranch('feature/add-oauth'), null)
  })

  it('returns null for main', () => {
    assert.equal(getTicketFromBranch('main'), null)
  })

  it('returns null for a branch with only numbers in the slug text', () => {
    assert.equal(getTicketFromBranch('feature/update-v2-api'), null)
  })

  // Prefers Jira/Linear over GitHub issue number when both present
  it('prefers Jira ticket over numeric slug', () => {
    assert.equal(getTicketFromBranch('feature/PROJ-123-issue-456-fix'), 'PROJ-123')
  })
})
