# I should have started early

This is the easy about my experince when building [T3 chat](https://t3.chat/) clone

## Why early

Even though i have seen the announcement post early , and started my intial development with [chef](https://chef.convex.dev/), I cloudn't continue for next few days, beacuse my collage project.

Even though i started it late, i enviroment was completely different , usually i used to work with [clerk](https://clerk.com/),[vercel AI sdk](https://ai-sdk.dev/) , [Neon](https://neon.com/)+[Drizzle](https://orm.drizzle.team/), but  this project was completely different , i have changed the DB and auth to [Convex](https://www.convex.dev/) and started using OpenAI SDK instead of vercel ai sdk


I know that i am not a great developer , and i cannot match the speed of t3.chat , but what i am is a good designer and i want to provide a good user experience. i have said is again and again the thinks i like about T3 chat is not their speed their colors across the  application , i want to take it open step a head by adding more color themes instead of one color theme


## Project structure

The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).

The backend code is in the `convex` directory.

`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## Contributing

This project is open source and contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
