import express from 'express'
import { Message } from './api-types'

export type Request<Parameters = {}, Body = {}, Query = {}> = express.Request<
  Parameters,
  {},
  Body,
  Query
>
export type Response<T = void> = express.Response<T | Message>
