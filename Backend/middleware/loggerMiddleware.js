// middleware/loggerMiddleware.js
export const requestLogger = (req, res, next) => {
  if (process.env.DEBUG === "true") {
    console.log("[REQUEST LOG]");
    console.log("Route:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Time:", new Date().toLocaleString());
    console.log("Body:", req.body);
    console.log(
      "Headers:",
      req.headers.authorization ? "Auth header present" : "No auth header"
    );
    console.log("--------------------------------------------------------");
  }
  next();
};
