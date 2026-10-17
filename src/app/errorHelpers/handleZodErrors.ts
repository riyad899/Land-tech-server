import { ZodError } from "zod";

export const handleZodError = (err: ZodError) => {
  const errorSources = err.issues.map((issue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorSources,
  };
};
