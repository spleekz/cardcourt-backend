import { Document } from 'mongoose'
import { FullUserDocument, CardDocument } from '../../models/user'

declare global {
  namespace Express {
    interface Request {
      user: FullUserDocument
      card: CardDocument
    }
  }
}
