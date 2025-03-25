// lib/prismaDynamic.ts
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  new PrismaClient();
};
declare const globalThis: {
  PrismaGlobal: ReturnType<typeof prismaClientSingleton>; //khai báo 1 biến toàn cục global This.Mục đích lưu trữ PrismaClient dưới dạng global Thís
} & typeof global;

const prisma = globalThis.PrismaGlobal ?? prismaClientSingleton();

export default prisma;
if (process.env.NODE !== "production") globalThis.PrismaGlobal = prisma;
