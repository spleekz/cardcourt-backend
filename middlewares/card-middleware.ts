import express, { NextFunction } from 'express'
import mongoose from 'mongoose'
import { Request, Response } from '../api/server-utility-types'
import { CardModel } from '../models/card'

export async function cardMiddleware<RequestBody extends { _id: string }>(
  req: Request<{}, RequestBody>,
  res: Response,
  next: NextFunction
) {
  const { _id } = req.body

  const isIdValid = mongoose.Types.ObjectId.isValid(_id)

  if (!isIdValid) {
    return res.status(404).json({ message: 'Неверный формат id карточки' })
  }

  const thisCard = await CardModel.findById(_id)

  if (!thisCard) {
    return res.status(404).json({ message: `Не существует карточки с id ${_id}!` })
  }

  req.card = thisCard
  next()
}
