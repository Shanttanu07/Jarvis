import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({

    sendFrame: publicProcedure
    .input(z.object({
        frame: z.string(),
        text: z.string(),
      }))
    .mutation(({ input }) => {
        const frameData = input.frame;
        console.log('h')
        console.log(input.text)
        // Process frame using OpenCV (Python, C++, etc.)
        // You can either use a bridge like opencv4nodejs or call an external API.
  
        return {
          result: ''
        };
    }),

    sendCommand: publicProcedure
    .input(z.object({
        command: z.string(),
      }))
    .mutation(({ input }) => {

        console.log(input.command)
        // Process frame using OpenCV (Python, C++, etc.)
        // You can either use a bridge like opencv4nodejs or call an external API.
  
        return {
          result: ''
        };
    }),
});