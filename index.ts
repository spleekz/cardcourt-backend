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
  LoginUserData,
  RegisterUserData,
  Token,
  SendedCard,
  DeletedCard,
  MeResponse,
  UpdatedCard,
  Card,
  CardsResponse,
  PublicUserInfo,
  CardCountResponse,
  CreateCardResponse,
  UpdateCardResponse,
} from './api/api-types'

const app: express.Application = express()

const port = config.port

app.use(cors())
app.use(express.json())

mongoose.connect(config.uri).then((db) => {})

app.listen(port, () => {
  console.log(`server started on port ${port}`)
})

app.post('/register', async (req: Request<{}, RegisterUserData>, res: Response<Token>) => {
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

app.post('/login', async (req: Request<{}, LoginUserData>, res: Response<Token>) => {
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

app.post(
  '/card',
  authMiddleware,
  async (req: Request<{}, SendedCard>, res: Response<CreateCardResponse>) => {
    const { name } = req.body
    const authorId = req.user._id

    const sameCard = await CardModel.findOne({ name, author: req.user._id })

    if (sameCard) {
      return res.json({
        message: 'Вы уже создали карточку с таким названием!',
      })
    }

    const card = new CardModel({ ...req.body, author: req.user._id })

    await card.save()

    await UserModel.updateOne({ _id: authorId }, { $push: { cards: card._id } })

    return res.json({ _id: card._id })
  }
)

app.delete(
  '/card',
  authMiddleware,
  cardMiddleware,
  async (req: Request<{}, DeletedCard>, res: Response) => {
    const { user, card } = req
    if (!user._id.equals(card.author._id)) {
      return res.status(403).json({ message: 'Вы не можете удалить эту карточку!' })
    }

    await card.delete()

    await UserModel.updateOne({ _id: user._id }, { $pullAll: { cards: [{ _id: card._id }] } })

    return res.json({ message: `Карточка '${card.name}' удалена!` })
  }
)

app.put(
  '/card',
  authMiddleware,
  cardMiddleware,
  async (req: Request<{}, UpdatedCard>, res: Response<UpdateCardResponse>) => {
    const { user } = req
    const updatedCard = req.body

    const thisCard = await CardModel.findById(updatedCard._id)

    if (!thisCard) {
      return res.status(404).json({ message: 'Вы пытаетесь обновить несуществующую карточку!' })
    }

    if (!user._id.equals(updatedCard.author._id)) {
      return res.status(400).json({ message: 'Вы не можете обновить эту карточку!' })
    }

    await CardModel.updateOne({ _id: updatedCard._id }, { $set: updatedCard })

    const cardAfterUpdate = await CardModel.findById(updatedCard._id).populate('author', 'name')

    return res.json({
      updatedCard: cardAfterUpdate,
    })
  }
)

app.get('/card/:cardId', async (req: Request<{ cardId: string }>, res: Response<Card>) => {
  const { cardId } = req.params

  const card = await CardModel.findById(cardId).populate('author', 'name')

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
  by?: string
}

app.get('/cards', async (req: Request<{}, {}, GetCardsQuery>, res: Response<CardsResponse>) => {
  const { page = 1, pageSize = 5, search = '', by } = req.query

  let pagesToLoad = !isNaN(Number(req.query.pagesToLoad)) ? Number(req.query.pagesToLoad) : 1
  if (pagesToLoad === 0) {
    return res.json({
      cards: [],
      maxLoadedPage: 0,
      pageCount: 0,
    })
  }

  const searchRegex = new RegExp(search, 'i')

  const cardsAuthor = await UserModel.findOne({ name: by })

  if (by && !cardsAuthor) {
    return res.status(404).json({ message: `Пользователя ${by} не существует!` })
  }

  const allCards = await CardModel.find({
    $and: [
      {
        author: cardsAuthor ? cardsAuthor._id : { $exists: true },
      },
      {
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
      },
    ],
  })

  const pageCount = Math.ceil(allCards.length / +pageSize)

  if (+pageCount === 0) {
    return res.status(200).json({
      cards: [],
      maxLoadedPage: 0,
      pageCount: 0,
    })
  }

  const isUserAskedMorePages = +page + pagesToLoad > pageCount

  const maxLoadedPage = isUserAskedMorePages ? +pageCount : +page + pagesToLoad - 1
  if (isUserAskedMorePages) {
    pagesToLoad = +pageCount - +page + 1
  }

  const cards = await CardModel.find({
    $and: [
      {
        author: cardsAuthor ? cardsAuthor._id : { $exists: true },
      },
      {
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
      },
    ],
  })
    .populate({ path: 'author', select: 'name' })
    .skip((+page - 1) * +pageSize)
    .limit(+pageSize * pagesToLoad)
    .sort({ _id: -1 })

  return res.json({
    cards,
    pageCount,
    maxLoadedPage: +maxLoadedPage,
  })
})

type GetCardsPageCountQuery = Pick<GetCardsQuery, 'pageSize' | 'search' | 'by'>

app.get(
  '/cardCount',
  async (req: Request<{}, {}, GetCardsPageCountQuery>, res: Response<CardCountResponse>) => {
    const { pageSize = 5, search = '', by } = req.query

    const searchRegex = new RegExp(search, 'i')

    const cardsAuthor = await UserModel.findOne({ name: by })

    const allCards = await CardModel.find({
      $and: [
        {
          author: cardsAuthor ? cardsAuthor._id : { $exists: true },
        },
        {
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
        },
      ],
    })

    const cardCount = allCards.length
    const pageCount = Math.ceil(allCards.length / +pageSize)

    return res.json({
      pageCount: pageCount,
      cardCount: cardCount,
    })
  }
)

app.get('/me', authMiddleware, async (req, res: Response<MeResponse>) => {
  const { user } = req

  const userData = await UserModel.findOne({ name: user.name })

  if (!userData) {
    return res.json({ message: 'Неизвестная ошибка' })
  }

  return res.json({
    name: userData.name,
  })
})

app.get(
  '/userInfo/:userName',
  async (req: Request<{ userName: string }>, res: Response<PublicUserInfo>) => {
    const { userName } = req.params

    const user = await UserModel.findOne({ name: userName }).populate({
      path: 'cards',
      populate: {
        path: 'author',
        select: 'name',
      },
    })

    if (!user) {
      return res.status(404).json({ message: `Пользователь ${userName} не найден` })
    }

    return res.json({
      name: user.name,
    })
  }
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.resolve(__dirname, '', 'swagger.json'))
})
