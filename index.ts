import express from 'express'
import config from './config.json'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json'
import path from 'path'

const app: express.Application = express()

const port = config.port

app.use(cors())
app.use(express.json())

mongoose.connect(config.uri).then((db) => {})

app.listen(port, () => {
  console.log(`server started on port ${port}`)
})

interface RegistrationRequest {
  name: string
  password: string
}
interface RegistrationResponse {
  token: string
  user: {
    name: string  
  }
}

app.post(
  '/register',
  async (req: Request<RegistrationRequest>, res: Response<RegistrationResponse>) => {
  const { name, password } = req.body

    const candidates = await User.findOne({ name })

    if (candidates) {
      return res.json({ code: Codes.Error, message: 'Уже есть пользователь с таким именем!' })
    }

    const hashedPassword = await bcrypt.hash(password, 4)

      const user = new User({ name, password: hashedPassword })
    await user.save()

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
