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

interface LoginResponse {
  token: string
  user: {
    name: string
  }
}

interface LoginRequest {
  name: string
  password: string
}

app.post('/login', async (req: Request<LoginRequest>, res: Response<LoginResponse>) => {
  const { name, password } = req.body

  const user = await User.findOne({ name })

    if (!user) {
    return res.json({ code: Codes.Error, message: 'Нет пользователя с таким именем!' })
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password)

    if (!isPasswordValid) {
    return res.json({ code: Codes.Error, message: 'Неверный пароль!' })
    }

    const token = jwt.sign({ name: user.name }, config.secret, { expiresIn: '1h' })

    return res.json({
    code: Codes.Success,
      data: {
        token,
        user: {
          name: user.name,
        },
      },
  })
})
    })
  })
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.resolve(__dirname, '', 'swagger.json'))
})
