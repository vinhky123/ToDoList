const logRequestResponse = (req, res, next) => {
  const start = Date.now();
  console.log(
    `-Request Method: ${req.method}, Request URL: ${
      req.originalUrl
    }, Request Body: ${JSON.stringify(req.body)}`
  );
  res.on("finish", () => {
    console.log(
      `-Response Status: ${res.statusCode}, Response Time: ${
        Date.now() - start
      }ms`
    );
  });
  next();
};

export default logRequestResponse;
