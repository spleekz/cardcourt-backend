/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface MessageResponse {
  message: string;
}

export interface Id {
  _id: string;
}

export interface Token {
  token: string;
}

export interface RegisterUserData {
  name: string;
  password: string;
}

export type RegisterUserResponse = Token;

export interface LoginUserData {
  name: string;
  password: string;
}

export type LoginUserResponse = Token;

export type FullUser = RegisterUserData & PublicUser;

export interface PublicUserInfo {
  name: string;
}

export interface PublicUserFeatures {
  publicCards: Cards;
}

export interface PublicUser {
  publicUserInfo: PublicUserInfo;
  publicUserFeatures: PublicUserFeatures;
}

export interface Me {
  name: string;
}

export type CreateCardResponse = Id;

export interface CardUI {
  bodyColor: string;
  wordsColor: string;
}

export interface CardAuthor {
  name: string;
  _id: string;
}

export interface CardAuthorField {
  author: CardAuthor;
}

export interface EditedCardFields {
  ui: CardUI;
  words: (CardWord | SendedCardWord)[];
  name: string;
}

export interface SendedCardWord {
  en: string;
  ru: string;
}

export type CardWord = SendedCardWord & Id;

export type SendedCardWords = SendedCardWord[];

export type CardWords = CardWord[];

export interface SendedCard {
  name: string;
  words: SendedCardWords;
  ui: CardUI;
}

export type Card = { author: CardAuthor; words: CardWords } & SendedCard & Id;

export type DeletedCard = Id;

export type UpdatedCard = Id & EditedCardFields & CardAuthorField;

export interface UpdateCardResponse {
  updatedCard: Card;
}

export type Cards = Card[];

export interface CardCountResponse {
  pageCount: number;
  cardCount: number;
}

export interface CardsResponse {
  cards: Cards;
  maxLoadedPage: number;
  pageCount: number;
}
