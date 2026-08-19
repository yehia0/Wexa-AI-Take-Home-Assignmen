// Central error handler. Distinguishes "CognoDB is unreachable" from
// application/query errors so the frontend can show the right empty/error state.
export function errorHandler(err, req, res, next) {
  console.error("[error]", err.message);

  const isConnectionError =
    err.code === "ServiceUnavailable" ||
    err.code === "SessionExpired" ||
    /ECONNREFUSED|ETIMEDOUT|connection/i.test(err.message);

  if (isConnectionError) {
    return res.status(503).json({
      error: "database_unreachable",
      message: "Can't reach the graph database right now. Please try again shortly.",
    });
  }

  res.status(500).json({
    error: "internal_error",
    message: "Something went wrong processing that request.",
  });
}
