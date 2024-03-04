import { Hono } from 'hono'
import userRouter from './routes/user'
import blogRouter from './routes/blog'

interface Env {
  Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
  Variables: {
    userId: string
  }
}
const app = new Hono<Env>();

app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app