import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@husainmodiwala/common";

interface Env {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}

const blogRouter = new Hono<Env>();

blogRouter.use("/", async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    console.log('in');

    const token = c.req.header("Authorization")?.replace("Bearer ", "") ?? "";
    if (!token) throw new Error("Invalid token.");
    const { id } = await verify(token, c.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      c.status(403);
      return c.json("No user found.");
    }
    console.log('user found');

    c.set("userId", id);
    await next();
    console.log(id);

  } catch (error) {
    return c.json({ 'error': error });
  }
});

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if(!success) {
      c.status(400)
      return c.json({"msg": "Invalid inputs."})
    }

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: parseInt(c.get("userId")),
      },
    });

    c.status(200);
    return c.json({ blogId: blog.id });
  } catch (error) {
    c.status(500);
    return c.text("Some error occured", error ?? "");
  }
});

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if(!success) {
      c.status(400)
      return c.json({"msg": "Invalid inputs."})
    }

    const blog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    c.status(200);
    return c.json({ blogId: blog.id });
  } catch (error) {
    c.status(500);
    return c.text("Some error occured", error ?? "");
  }

  return c.text("Hello Hono!");
});

blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        console.log('bulk');

      const blogs = await prisma.blog.findMany();
      c.status(200);
      return c.json(blogs);
    } catch (error) {
      c.status(500);
      return c.text("Some error occured", error ?? "");
    }
  });

blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    console.log('id');

    const { id } = await c.req.param();
    const blog = await prisma.blog.findUnique({
      where: {
        id: Number(id),
      },
    });

    c.status(200);
    return c.json(blog);
  } catch (error) {
    c.status(500);
    return c.text("Some error occured", error ?? "");
  }
});

export default blogRouter;
