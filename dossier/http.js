const http = require("http");
// class MiniExpress {
//   constructor() {
//     this.middlewares = []; // pile des middlewares
//   }

//   use(middleware) {
//     this.middlewares.push(middleware); // ajouter à la pile
//   }

//   listen(port, callback) {
//     const server = http.createServer((req, res) => {
//       let index = 0;

//       const next = () => {
//         const middleware = this.middlewares[index];
//         index++;
//         if (middleware) {
//           middleware(req, res, next);
//         }
//       };

//       next(); // lancer le 1er middleware
//     });

//     server.listen(port, callback);
//   }
// }

// const app = new MiniExpress();

// // 🔽 Middleware 1
// app.use((req, res, next) => {
//   console.log('Middleware 1');
//   next();
// });

// // 🔽 Middleware 2
// app.use((req, res, next) => {
//   console.log('Middleware 2');
//   res.end('Reponse envoyee !');
// });

// app.listen(3000, () => {
//   console.log('Serveur démarré sur http://localhost:3000');
// });
const server = http.createServer((req, res) => {
  console.log(req.method);
//   console.log("hi");
  res.end("hello");
});
server.listen(3000, () => {
  console.log("listing");
});