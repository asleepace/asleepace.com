import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const model = {

  getAccessToken: async () => {
    return new Promise((resolve) => resolve('works!'));
  },

  getAuthorizationCode: async (done: Function) => {
    done(null, 'works!');
  },

  getClient: async () => {

  },  

  getUser: async () => {
    
  }

}