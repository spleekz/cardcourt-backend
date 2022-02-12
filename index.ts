import express from 'express'
import config from './config.json'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json'
import path from 'path'
import { authMiddleware } from './middlewares/auth-middleware'
import { cardMiddleware } from './middlewares/card-middleware'
import { UserModel } from './models/user'
import { CardModel } from './models/card'
import { Request, Response } from './api/server-utility-types'
import {
  LoginUser,
  RegisterUser,
  Token,
  SendedCard,
  DeletedCard,
  Me,
  UpdatedCard,
  Card,
  CardsResponse,
  Cards,
} from './api/api-types'

const app: express.Application = express()

const port = config.port

app.use(cors())
app.use(express.json())

mongoose.connect(config.uri).then((db) => {})

app.listen(port, () => {
  console.log(`server started on port ${port}`)
})

app.post('/register', async (req: Request<{}, RegisterUser>, res: Response<Token>) => {
  const { name, password } = req.body

  const candidates = await UserModel.findOne({ name })

  if (candidates) {
    return res.json({ message: 'Уже есть пользователь с таким именем!' })
  }

  const hashedPassword = await bcrypt.hash(password, 4)

  const user = new UserModel({ name, password: hashedPassword })
  await user.save()

  const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: '10h' })

  return res.json({
    token,
  })
})

app.post('/login', async (req: Request<{}, LoginUser>, res: Response<Token>) => {
  const { name, password } = req.body

  const user = await UserModel.findOne({ name })

  if (!user) {
    return res.json({ message: 'Нет пользователя с таким именем!' })
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password)

  if (!isPasswordValid) {
    return res.json({ message: 'Неверный пароль!' })
  }

  const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: '10h' })

  return res.json({
    token,
  })
})

app.post('/card', authMiddleware, async (req: Request<{}, SendedCard>, res: Response) => {
  const { name } = req.body
  const author = req.user.name

  const sameCard = await CardModel.findOne({ name, author })

  if (sameCard) {
    return res.json({
      message: 'Вы уже создали карточку с таким названием!',
    })
  }

  const card = new CardModel({ ...req.body, author })
  await card.save()

  return res.json({ message: 'Карточка создана!' })
})

app.delete(
  '/card',
  authMiddleware,
  cardMiddleware,
  async (req: Request<{}, DeletedCard>, res: Response) => {
    const { user, card } = req

    if (!(user.name === card.author)) {
      return res.json({ message: 'Вы не можете удалить эту карточку!' })
    }

    await card.delete()
    return res.json({ message: `Карточка '${card.name}' удалена!` })
  }
)

app.put(
  '/card',
  authMiddleware,
  cardMiddleware,
  async (req: Request<{}, UpdatedCard>, res: Response) => {
    const { user } = req
    const updatedCard = req.body

    const cardAuthor = user.name
    const thisCard = await CardModel.findById(updatedCard._id)

    const isAuthor = cardAuthor === thisCard?.author

    if (!isAuthor) {
      return res.status(400).json({ message: 'Вы не можете обновить эту карточку!' })
    }

    await CardModel.updateOne({ _id: updatedCard._id }, { $set: updatedCard })

    return res.json({ message: 'Карточка успешно обновлена!' })
  }
)

app.get('/card/:cardId', async (req: Request<{ cardId: string }>, res: Response<Card>) => {
  const { cardId } = req.params

  const card = await CardModel.findById(cardId)

  if (!card) {
    return res.status(404).json({ message: 'Нет такой карточки!' })
  }

  return res.json(card)
})

interface GetCardsQuery {
  page?: string
  pagesToLoad?: string
  search?: string
  pageSize?: string
}

app.get('/cards', async (req: Request<{}, {}, GetCardsQuery>, res: Response<CardsResponse>) => {
  const { page = 1, pagesToLoad = 1, pageSize = 5, search = '' } = req.query

  const searchRegex = new RegExp(search, 'i')

  const allCards = await CardModel.find({
    $or: [
      {
        name: searchRegex,
      },
      {
        'words.en': searchRegex,
      },
      {
        'words.ru': searchRegex,
      },
    ],
  })

  const pageCount = Math.ceil(allCards.length / +pageSize)

  if (+page + +pagesToLoad - 1 > pageCount) {
    return res.status(404).json({ message: `Максимальное кол-во страниц - ${pageCount}` })
  }

  const cards = await CardModel.find({
    $or: [
      {
        name: searchRegex,
      },
      {
        'words.en': searchRegex,
      },
      {
        'words.ru': searchRegex,
      },
    ],
  })
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize * +pagesToLoad)

  return res.json({
    cards,
    pageCount,
  })
})

app.get('/me', authMiddleware, async (req, res: Response<Me>) => {
  const { user } = req

  const userData = await UserModel.findOne({ name: user.name })

  if (!userData) {
    return res.json({ message: 'Неизвестная ошибка' })
  }

  return res.json({
    name: userData.name,
  })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.resolve(__dirname, '', 'swagger.json'))
})
