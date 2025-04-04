/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Hashids = require('hashids/cjs')
import { type Request, type Response } from 'express'
import { challenges } from '../data/datacache'

const challengeUtils = require('../lib/challengeUtils')
const hashidsAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
const hashidRegexp = /^[a-zA-Z0-9]+$/
const invalidContinueCode = 'Invalid continue code.'

module.exports.restoreProgress = function restoreProgress () {
  return ({ params }: Request, res: Response) => {
    const hashids = new Hashids('this is my salt', 60, hashidsAlphabet)
    const continueCode = params.continueCode
    if (!hashidRegexp.test(continueCode)) {
      return res.status(404).send(invalidContinueCode)
    }
    const ids = hashids.decode(continueCode)
    if (challengeUtils.notSolved(challenges.continueCodeChallenge) && ids.includes(999)) {
      challengeUtils.solve(challenges.continueCodeChallenge)
      res.end()
    } else if (ids.length > 0) {
      for (const name in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, name)) {
          if (ids.includes(challenges[name].id)) {
            challengeUtils.solve(challenges[name], true)
          }
        }
      }
      res.json({ data: ids.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send(invalidContinueCode)
    }
  }
}

module.exports.restoreProgressFindIt = function restoreProgressFindIt () {
  return async ({ params }: Request, res: Response) => {
    const hashids = new Hashids('this is the salt for findIt challenges', 60, hashidsAlphabet)
    const continueCodeFindIt = params.continueCode
    if (!hashidRegexp.test(continueCodeFindIt)) {
      return res.status(404).send(invalidContinueCode)
    }
    const idsFindIt = hashids.decode(continueCodeFindIt)
    if (idsFindIt.length > 0) {
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          if (idsFindIt.includes(challenges[key].id)) {
            await challengeUtils.solveFindIt(key, true)
          }
        }
      }
      res.json({ data: idsFindIt.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send(invalidContinueCode)
    }
  }
}

module.exports.restoreProgressFixIt = function restoreProgressFixIt () {
  const hashids = new Hashids('yet another salt for the fixIt challenges', 60, hashidsAlphabet)
  return async ({ params }: Request, res: Response) => {
    const continueCodeFixIt = params.continueCode
    if (!hashidRegexp.test(continueCodeFixIt)) {
      return res.status(404).send(invalidContinueCode)
    }
    const idsFixIt = hashids.decode(continueCodeFixIt)
    if (idsFixIt.length > 0) {
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          if (idsFixIt.includes(challenges[key].id)) {
            await challengeUtils.solveFixIt(key, true)
          }
        }
      }
      res.json({ data: idsFixIt.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send(invalidContinueCode)
    }
  }
}
