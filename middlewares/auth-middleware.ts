import express from 'express'
import jwt from 'jsonwebtoken'
import config from '../config.json'
import { Response } from '../api/server-utility-types'
import { UserModel } from '../models/user'
import { Id } from '../api/api-types'

export const authMiddleware = async (
  req: express.Request,
  res: Response,
  next: express.NextFunction
) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Ошибка авторизации!' })
  }

  const token = req.headers.authorization.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Ошибка авторизации!' })
  }

  const userId = (jwt.verify(token, config.secret) as Id)._id

  const user = await UserModel.findById(userId)

  if (!user) {
    return res.status(404).json({ message: `Пользователь с id ${userId} не существует!` })
  }

  req.user = user
  next()
}
