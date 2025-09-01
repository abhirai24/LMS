const {Document, Model} = require("mongoose");

const generateLast12MonthData = async (model) => {
  const currentDate = new Date();
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    return date;
  });

  const data = await model.aggregate([
    {
      $match: {
        createdAt: {
          $gte: last12Months[11],
          $lte: last12Months[0],
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        },
        total: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthlyData = last12Months.map((date) => {
    const month = date.toISOString().slice(0, 7);
    const found = data.find((item) => item._id === month);
    return found ? found.total : 0;
  });

  return monthlyData;
};


module.exports = {generateLast12MonthData};