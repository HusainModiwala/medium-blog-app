import { Hono } from "hono"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { signUpBody, signInBody } from '@husainmodiwala/common';
import { sign } from 'hono/jwt';


interface Env {
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    },
}

const userRouter = new Hono<Env>();


userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
      const body = await c.req.json();
      const result = signUpBody.safeParse(body);
      if(!result.success) throw new Error("Invalid credentials.");

      const user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: body.password
        }
      })

      const token = await sign({id: user.id}, c.env.JWT_SECRET);
      return c.json({token})
    } catch(err){
      return c.json(err);
    }
})


userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const result = signInBody.safeParse(body);
    if(!result.success) throw new Error("Invalid credentials.");

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
          password: body.password
        }
      });

      if(!user) throw new Error("User doesnot exist");
      const token = await sign({id: user.id}, c.env.JWT_SECRET);
      return c.json({token});
    } catch (error) {
      return c.json({error});
    }
})

export default userRouter;