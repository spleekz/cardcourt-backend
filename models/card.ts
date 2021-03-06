import { Schema, model, Document } from 'mongoose'
import { Card } from '../api/api-types'

const wordSchema = new Schema({
  en: { type: String, required: true },
  ru: { type: String, required: true },
})

export const cardSchema = new Schema(
  {
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    words: [wordSchema],
    ui: {
      bodyColor: { type: String, required: true },
      wordsColor: { type: String, required: true },
    },
  },
  { versionKey: false }
)

export type CardDocument = Document<any, any, Card> & Card

export const CardModel = model<Card>('Card', cardSchema)
