export const Then = (res: any) => {
  return (result: any) => {
    return res.status(200).json({
      success: true,
      message: "Success",
      result,
    });
  };
};

export const Catch = (res: any) => {
  return (err: any) =>
    res.status(400).json({
      success: false,
      message: err,
      result: [],
    });
};

export const NotFound = (res: any) => {
  return (result: any) =>
    res.status(400).json({
      success: false,
      message: "Unable to get any results",
      result,
    });
};
